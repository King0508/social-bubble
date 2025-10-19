import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const BubbleVisualization = ({ posts }) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [scalingInfo, setScalingInfo] = useState(null);

  // Update dimensions on window resize
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Color scale for hashtags
  const getColorForHashtag = (hashtag) => {
    const colors = [
      '#667eea', // purple
      '#f093fb', // pink
      '#4facfe', // blue
      '#43e97b', // green
      '#fa709a', // rose
      '#fee140', // yellow
      '#30cfd0', // cyan
      '#a8edea', // light cyan
      '#ff6b6b', // red
      '#feca57', // orange
    ];
    
    // Use hashtag to determine color
    const hashCode = hashtag.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hashCode) % colors.length];
  };

  // Create and update visualization
  useEffect(() => {
    if (!posts.length || !dimensions.width || !dimensions.height) return;

    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);

    // Clear previous content
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    // Group posts by hashtag
    const hashtagGroups = {};
    posts.forEach(post => {
      if (post.hashtags && post.hashtags.length > 0) {
        post.hashtags.forEach(hashtag => {
          if (!hashtagGroups[hashtag]) {
            hashtagGroups[hashtag] = [];
          }
          hashtagGroups[hashtag].push(post);
        });
      } else {
        // Posts without hashtags go into a default group
        if (!hashtagGroups['#general']) {
          hashtagGroups['#general'] = [];
        }
        hashtagGroups['#general'].push(post);
      }
    });

    // Create hierarchical data structure - only include topics with 2+ posts
    const hierarchicalData = Object.entries(hashtagGroups)
      .map(([hashtag, groupPosts]) => {
        const totalEngagement = groupPosts.reduce((sum, p) => sum + p.engagement_score, 0);
        return {
          hashtag,
          posts: groupPosts,
          totalEngagement,
          color: getColorForHashtag(hashtag),
        };
      })
      .filter(group => group.posts.length >= 2); // Only show topics with 2+ children

    // Calculate total space needed and scale factor to prevent overlap
    const totalBubbles = hierarchicalData.length;
    const totalPosts = posts.length;
    
    // Estimate space usage: assume average area per bubble cluster
    const availableArea = (width - 200) * (height - 200); // Account for margins
    
    // Base sizes that will be scaled down if needed
    const baseChildRadius = 25;
    const baseMinParentRadius = 100;
    
    // Calculate total area needed with base sizes
    let estimatedTotalArea = 0;
    hierarchicalData.forEach(group => {
      const numChildren = group.posts.length;
      const childArea = Math.PI * baseChildRadius * baseChildRadius;
      const totalChildArea = childArea * numChildren * 1.5;
      const parentRadius = Math.max(baseMinParentRadius, Math.sqrt(totalChildArea / Math.PI));
      // Parent area + padding for separation
      const clusterArea = Math.PI * (parentRadius + 60) * (parentRadius + 60);
      estimatedTotalArea += clusterArea;
    });
    
    // Calculate scale factor to fit everything without overlap
    // Use more conservative scaling (0.6 of available area)
    const targetArea = availableArea * 0.6;
    const scaleFactor = estimatedTotalArea > targetArea 
      ? Math.sqrt(targetArea / estimatedTotalArea) 
      : 1.0;
    
    // Log scaling information and update UI indicator
    if (scaleFactor < 1.0) {
      const scalePercent = Math.floor(scaleFactor * 100);
      console.log(`🔄 Scaling bubbles to ${scalePercent}% to prevent overlap`);
      console.log(`📊 ${totalBubbles} topics, ${totalPosts} posts, Scale: ${scaleFactor.toFixed(2)}`);
      setScalingInfo({ percent: scalePercent, topics: totalBubbles, posts: totalPosts });
    } else {
      setScalingInfo(null);
    }
    
    // Apply scale factor with minimum limits
    const childRadius = Math.max(15, baseChildRadius * scaleFactor); // Min 15px
    const minParentRadius = Math.max(60, baseMinParentRadius * scaleFactor); // Min 60px
    
    // Function to calculate required parent radius based on number of children
    const calculateParentRadius = (numChildren) => {
      if (numChildren === 0) return minParentRadius;
      
      // Calculate area needed for all children with padding
      const childArea = Math.PI * childRadius * childRadius;
      const totalChildArea = childArea * numChildren * 1.6; // More spacing to prevent overlap
      
      // Calculate parent radius from area
      const minRadius = Math.sqrt(totalChildArea / Math.PI);
      return Math.max(minParentRadius, minRadius);
    };

    // Create defs for patterns (profile pictures)
    const defs = svg.append('defs');

    // Add patterns for each post's avatar
    posts.forEach((post, i) => {
      if (post.author_avatar) {
        const pattern = defs.append('pattern')
          .attr('id', `avatar-${i}`)
          .attr('width', 1)
          .attr('height', 1)
          .attr('patternContentUnits', 'objectBoundingBox');

        pattern.append('image')
          .attr('href', post.author_avatar)
          .attr('width', 1)
          .attr('height', 1)
          .attr('preserveAspectRatio', 'xMidYMid slice');
      }
    });

    // Flatten data for simulation with improved child positioning
    const simulationNodes = [];
    
    hierarchicalData.forEach((group, groupIndex) => {
      // Calculate parent radius based on number of children
      const numChildren = group.posts.length;
      const parentRadius = calculateParentRadius(numChildren);
      
      const parentNode = {
        type: 'parent',
        hashtag: group.hashtag,
        color: group.color,
        radius: parentRadius,
        x: Math.random() * width,
        y: Math.random() * height,
        fx: null,
        fy: null,
      };
      simulationNodes.push(parentNode);

      // Arrange children with STRICT no-overlap constraints
      const arrangeChildren = (children, parentRadius) => {
        if (children.length === 0) return [];
        if (children.length === 1) {
          return [{ x: 0, y: 0 }]; // Center for single child
        }
        
        const positions = [];
        const safeZone = 8; // Extra safety margin
        const maxRadius = parentRadius - childRadius - safeZone;
        const minDistance = childRadius * 2 + safeZone; // HARD minimum distance
        const maxAttempts = 200; // More attempts for better placement
        
        // Place children using strict Poisson disc sampling
        for (let i = 0; i < children.length; i++) {
          let placed = false;
          let bestPosition = null;
          let bestMinDistance = 0;
          
          for (let attempt = 0; attempt < maxAttempts; attempt++) {
            // Random position within circle
            const angle = Math.random() * 2 * Math.PI;
            const r = Math.sqrt(Math.random()) * maxRadius;
            
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            
            // Check distance to ALL existing positions
            let minDistanceToOthers = Infinity;
            let hasConflict = false;
            
            for (const pos of positions) {
              const dx = x - pos.x;
              const dy = y - pos.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              minDistanceToOthers = Math.min(minDistanceToOthers, distance);
              
              if (distance < minDistance) {
                hasConflict = true;
                break;
              }
            }
            
            // Track best position even if we can't place perfectly
            if (!hasConflict) {
              positions.push({ x, y });
              placed = true;
              break;
            } else if (minDistanceToOthers > bestMinDistance) {
              bestMinDistance = minDistanceToOthers;
              bestPosition = { x, y };
            }
          }
          
          // If couldn't place with strict spacing, use best position found
          // This should rarely happen with proper scaling
          if (!placed && bestPosition) {
            positions.push(bestPosition);
          } else if (!placed) {
            // Last resort: place on a circle
            const angle = (i / children.length) * 2 * Math.PI;
            const r = Math.min(maxRadius * 0.8, maxRadius);
            positions.push({
              x: Math.cos(angle) * r,
              y: Math.sin(angle) * r,
            });
          }
        }
        
        return positions;
      };
      
      const childPositions = arrangeChildren(group.posts, parentRadius);

      // Add child nodes with calculated positions
      group.posts.forEach((post, postIndex) => {
        const pos = childPositions[postIndex] || { x: 0, y: 0 };
        simulationNodes.push({
          type: 'child',
          post,
          parent: parentNode,
          radius: childRadius,
          color: group.color,
          hashtag: group.hashtag,
          postIndex: simulationNodes.length,
          x: parentNode.x + pos.x,
          y: parentNode.y + pos.y,
          targetX: pos.x,
          targetY: pos.y,
        });
      });
    });

    // Calculate minimum separation for parent bubbles (includes label space)
    const labelHeight = 35; // Space needed for labels above bubble
    const minParentSeparation = d => {
      if (d.type === 'parent') {
        // Radius + label space + safety margin
        return d.radius + labelHeight + 20;
      }
      return d.radius + 5;
    };
    
    // Create simulation with VERY STRONG collision detection - HARD CONSTRAINTS
    const simulation = d3.forceSimulation(simulationNodes)
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide()
        .radius(minParentSeparation)
        .strength(1.0) // Maximum strength - HARD constraint
        .iterations(8) // Many iterations to resolve all collisions
      )
      .force('x', d3.forceX(width / 2).strength(0.02))
      .force('y', d3.forceY(height / 2).strength(0.02))
      .force('bounds', () => {
        // Hard boundary constraints
        simulationNodes.forEach(d => {
          if (d.type === 'parent') {
            const margin = d.radius + labelHeight + 10;
            d.x = Math.max(margin, Math.min(width - margin, d.x));
            d.y = Math.max(margin, Math.min(height - margin, d.y));
          }
        });
      })
      .alphaDecay(0.01) // Very slow decay for stable settling
      .velocityDecay(0.6); // High friction to prevent bouncing

    // Keep children locked to their target positions within parents
    simulation.force('parentChild', () => {
      simulationNodes.forEach(d => {
        if (d.type === 'child' && d.parent) {
          // Lock child to target position relative to parent
          d.x = d.parent.x + d.targetX;
          d.y = d.parent.y + d.targetY;
          
          // Zero out velocity for children (they move with parent only)
          d.vx = 0;
          d.vy = 0;
        }
      });
    });

    // Create parent bubble groups for better styling and labels
    const parentGroups = svg.selectAll('.parent-group')
      .data(simulationNodes.filter(d => d.type === 'parent'))
      .join('g')
      .attr('class', 'parent-group')
      .style('cursor', 'grab');

    // Add glow effect for parent bubbles
    const parentBubbles = parentGroups.append('circle')
      .attr('class', 'parent-bubble')
      .attr('r', d => d.radius)
      .attr('fill', d => d.color)
      .attr('fill-opacity', d => {
        // Vary opacity based on engagement (more popular = more visible)
        const maxEngagement = Math.max(...hierarchicalData.map(g => g.totalEngagement));
        const normalizedEngagement = d.hashtag ? 
          (hierarchicalData.find(g => g.hashtag === d.hashtag)?.totalEngagement || 0) / maxEngagement : 0;
        return 0.06 + (normalizedEngagement * 0.08); // Range: 0.06 to 0.14
      })
      .attr('stroke', d => d.color)
      .attr('stroke-width', 3)
      .attr('stroke-opacity', 0.7)
      .style('filter', d => {
        // More popular topics get stronger glow
        const maxEngagement = Math.max(...hierarchicalData.map(g => g.totalEngagement));
        const normalizedEngagement = d.hashtag ? 
          (hierarchicalData.find(g => g.hashtag === d.hashtag)?.totalEngagement || 0) / maxEngagement : 0;
        const glowIntensity = 10 + (normalizedEngagement * 15);
        return `drop-shadow(0 0 ${glowIntensity}px ${d.color}40)`;
      })
      .style('transition', 'all 0.3s ease');

    // Add topic labels with dynamic sizing based on scale factor
    const labelFontSize = Math.max(10, Math.min(14, 14 * scaleFactor));
    const countFontSize = Math.max(9, Math.min(11, 11 * scaleFactor));
    
    const parentLabels = parentGroups.append('text')
      .attr('class', 'parent-label')
      .attr('text-anchor', 'middle')
      .attr('y', d => -d.radius - 15)
      .style('font-size', `${labelFontSize}px`)
      .style('font-weight', '600')
      .style('fill', d => d.color)
      .style('opacity', 0.9)
      .style('text-shadow', '0 0 10px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.5)')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .text(d => {
        // Truncate long hashtags if bubbles are small
        const maxLength = Math.floor(d.radius / 5);
        return d.hashtag.length > maxLength 
          ? d.hashtag.substring(0, maxLength) + '...' 
          : d.hashtag;
      });

    // Add post count label with dynamic sizing
    parentGroups.append('text')
      .attr('class', 'parent-count')
      .attr('text-anchor', 'middle')
      .attr('y', d => -d.radius - 2)
      .style('font-size', `${countFontSize}px`)
      .style('font-weight', '500')
      .style('fill', '#999')
      .style('opacity', 0.8)
      .style('text-shadow', '0 0 8px rgba(0,0,0,0.9)')
      .style('pointer-events', 'none')
      .style('user-select', 'none')
      .text(d => {
        const group = hierarchicalData.find(g => g.hashtag === d.hashtag);
        return group ? `${group.posts.length}` : '';
      });

    // Add hover effects to parent bubbles
    parentGroups
      .on('mouseenter', function(event, d) {
        d3.select(this).select('.parent-bubble')
          .transition()
          .duration(200)
          .attr('stroke-width', 4)
          .attr('stroke-opacity', 1)
          .attr('fill-opacity', d => {
            const maxEngagement = Math.max(...hierarchicalData.map(g => g.totalEngagement));
            const normalizedEngagement = d.hashtag ? 
              (hierarchicalData.find(g => g.hashtag === d.hashtag)?.totalEngagement || 0) / maxEngagement : 0;
            return 0.12 + (normalizedEngagement * 0.1);
          });
        
        d3.select(this).select('.parent-label')
          .transition()
          .duration(200)
          .style('opacity', 1)
          .style('font-size', '16px');
      })
      .on('mouseleave', function(event, d) {
        d3.select(this).select('.parent-bubble')
          .transition()
          .duration(200)
          .attr('stroke-width', 3)
          .attr('stroke-opacity', 0.7)
          .attr('fill-opacity', d => {
            const maxEngagement = Math.max(...hierarchicalData.map(g => g.totalEngagement));
            const normalizedEngagement = d.hashtag ? 
              (hierarchicalData.find(g => g.hashtag === d.hashtag)?.totalEngagement || 0) / maxEngagement : 0;
            return 0.06 + (normalizedEngagement * 0.08);
          });
        
        d3.select(this).select('.parent-label')
          .transition()
          .duration(200)
          .style('opacity', 0.9)
          .style('font-size', '14px');
      })
      .call(d3.drag()
        .on('start', function(event, d) {
          d3.select(this).style('cursor', 'grabbing');
          simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', function(event, d) {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', function(event, d) {
          d3.select(this).style('cursor', 'grab');
          simulation.alphaTarget(0);
        })
      );

    // Create child bubbles (individual posts) with fade-in animation
    const childBubbles = svg.selectAll('.child-bubble')
      .data(simulationNodes.filter(d => d.type === 'child'))
      .join(
        enter => enter.append('g')
          .attr('class', 'child-bubble')
          .style('cursor', 'pointer')
          .style('opacity', 0)
          .call(enter => enter.transition()
            .duration(800)
            .delay((d, i) => i * 20) // Stagger animation
            .style('opacity', 1)
          ),
        update => update,
        exit => exit.transition()
          .duration(400)
          .style('opacity', 0)
          .remove()
      );

    // Add circles for child bubbles
    childBubbles.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => {
        const postIndex = posts.findIndex(p => p.post_uri === d.post.post_uri);
        return d.post.author_avatar ? `url(#avatar-${postIndex})` : d.color;
      })
      .attr('opacity', 0.9)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add interaction handlers
    childBubbles
      .on('mouseover', function(event, d) {
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('stroke-width', 4)
          .attr('opacity', 1);

        tooltip
          .style('opacity', 1)
          .style('left', `${event.pageX + 15}px`)
          .style('top', `${event.pageY + 15}px`)
          .html(`
            <div class="tooltip-author">@${d.post.author}</div>
            <div class="tooltip-text">${d.post.text.slice(0, 150)}${d.post.text.length > 150 ? '...' : ''}</div>
            ${d.post.hashtags && d.post.hashtags.length > 0 ? `
              <div class="tooltip-hashtags">
                ${d.post.hashtags.slice(0, 5).map(tag => `<span class="tooltip-hashtag">${tag}</span>`).join('')}
              </div>
            ` : ''}
            <div class="tooltip-engagement">
              <span>❤️ ${d.post.likes}</span>
              <span>🔄 ${d.post.reposts}</span>
              <span>💬 ${d.post.replies}</span>
            </div>
          `);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', `${event.pageX + 15}px`)
          .style('top', `${event.pageY + 15}px`);
      })
      .on('mouseout', function() {
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('stroke-width', 2)
          .attr('opacity', 0.9);

        tooltip.style('opacity', 0);
      })
      .on('click', function(event, d) {
        if (d.post.post_url) {
          window.open(d.post.post_url, '_blank');
        }
      });

    // Update positions on simulation tick with strict boundary enforcement
    simulation.on('tick', () => {
      parentGroups
        .attr('transform', d => {
          // STRICT boundary constraints - account for label space
          const margin = d.radius + labelHeight + 15;
          d.x = Math.max(margin, Math.min(width - margin, d.x));
          d.y = Math.max(margin, Math.min(height - margin, d.y));
          
          // Additional check: prevent any overlap with other parents
          simulationNodes.forEach(other => {
            if (other !== d && other.type === 'parent') {
              const dx = d.x - other.x;
              const dy = d.y - other.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const minDist = d.radius + other.radius + labelHeight + 25;
              
              if (distance < minDist && distance > 0) {
                // Push bubbles apart
                const pushStrength = (minDist - distance) / distance * 0.1;
                d.x += dx * pushStrength;
                d.y += dy * pushStrength;
                
                // Re-constrain
                d.x = Math.max(margin, Math.min(width - margin, d.x));
                d.y = Math.max(margin, Math.min(height - margin, d.y));
              }
            }
          });
          
          return `translate(${d.x},${d.y})`;
        });

      childBubbles
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [posts, dimensions]);

  return (
    <>
      <svg
        ref={svgRef}
        className="visualization"
        width={dimensions.width}
        height={dimensions.height}
      />
      <div ref={tooltipRef} className="tooltip" style={{ opacity: 0 }} />
      
      {/* Scaling indicator when bubbles are automatically resized */}
      {scalingInfo && (
        <div className="scaling-indicator">
          <div className="scaling-icon">⚖️</div>
          <div className="scaling-text">
            <div className="scaling-title">Auto-scaled to {scalingInfo.percent}%</div>
            <div className="scaling-subtitle">
              {scalingInfo.topics} topics • {scalingInfo.posts} posts • No overlap mode
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BubbleVisualization;

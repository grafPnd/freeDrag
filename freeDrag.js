	$.fn.extend({
		FD_: function(){
			var 
				$window = $(window),
				$el = this,
				el = this[0];
			return {
				restart: function(p,d){
					p.scrTop = 0;
					p.scrLeft = 0;
					el.destScope = d.scope;
					p.sortable = d.sortable;
					el.friends = $(el.destScope).children();
					el.dragEl.isExtra = false;
					window.document.body.appendChild(el.dragEl);
					if (typeof(d.dragMod) == 'function') {
						d.dragMod(el.dragEl);
					}
					if (d.maxItems !== undefined) {
						p.maxItems = d.maxItems;
					}
					if (d.insert) {
						p.inserted = (d && d.nsrc) ? d.nsrc : el.dragEl.cloneNode();
						if (p.maxItems !== undefined && el.friends && el.friends.length) {
							if (p.maxItems <= el.friends.length) {
								el.dragEl.isExtra = true;
								$(p.inserted).addClass('s_minimized s_noboard');
							}
						}
						el.destScope.appendChild(p.inserted);
						if (typeof(d.srcMod) == 'function') {
							d.srcMod(p.inserted, el.dragEl);
						}
					}
					p.leftScope = true;
					p.lim = this.getCoords(d.scope);
					if (el.destScope.nodeName.toLowerCase() == 'body') {
						p.lim.left = 0;
						p.lim.top = 0;
					}
					if (p.sortable) {
						this.getGrid(p);
					}
					if (typeof(d.srcPasted) == 'function') {
						d.srcPasted(p.inserted);
					}
					if (d.center) {
						el.runtime.shiftX = el.dragEl.clientWidth / 2;
						el.runtime.shiftY = el.dragEl.clientHeight / 2;
					}
				$el.FD_().moveAt({
					pageX: el.runtime.startX - p.lim.left,
					pageY: el.runtime.startY - p.lim.top}, p, true);
				},
				start: function(e,p){
					var
						coords,
						computed = window.getComputedStyle ? getComputedStyle(el, '') : el.currentStyle;
					p.overcrossing = p.overcrossing || 0;
					p.sensitivity = p.sensitivity || 1;
					if (p && p.scope) {
						if (p.scope == 'parent') {
							el.scope = el.parentNode;
						} else {
							el.scope = p.scope.length ? p.scope[0] : p.scope;
						}
					} else {
						el.scope = window.document.body;
					}
					this.getLim(p);
					coords = this.getCoords();
					el.fullHeight = el.offsetHeight + parseInt(computed.marginTop,10) + parseInt(computed.marginBottom,10);
					el.fullWidth = el.offsetWidth + parseInt(computed.marginLeft,10) + parseInt(computed.marginRight,10);
					el.runtime.shiftX = e.pageX - coords.left;//e.offsetX
					el.runtime.shiftY= e.pageY - coords.top;//e.offsetY	
					el.runtime.startX= e.pageX;
					el.runtime.startY= e.pageY;
					el.initIndex = null;
					if(p.trueDrag){//deprecated to use with any other parameters, it's not checked how it should work
						el.$dragEl = $(el);
						el.dragEl = el;
					}else{
						el.dragEl = p && p.ndrgel ? p.ndrgel : el.cloneNode();
						el.$dragEl = $(el.dragEl);
						el.dragEl.innerHTML = el.innerHTML;
						window.document.body.appendChild(el.dragEl);
						el.dragEl.origin = el;
						el.dragEl.className = el.dragEl.className.replace(/(s|j)_[^\s]*/igm,'');
					}
					this.getParents(p);
					if(p.sortable){
						this.getGrid(p);
						el.$dragEl.css({
							width: el.clientWidth + 'px',
							height: el.clientHeight + 'px'
						});
					}
				p.defferedMove = e;
					el.$dragEl.css({
						zIndex: 1000,
						position: 'absolute',
						margin: '0px'
					});
				if(!p.sourceCopy && !p.trueDrag){
						el.style.opacity = 0;
					}
					el.dragStarted = true;
					$el.bind("click.prevent", function (event) {
						event.stopImmediatePropagation();
					});
				$(document.body).children().addClass('s_noselect');
				if (window.getSelection) {
					if (window.getSelection().empty) {
						window.getSelection().empty();
					} else if (window.getSelection().removeAllRanges) {
						window.getSelection().removeAllRanges();
					}
				} else if (document.selection) {
					document.selection.empty();
				}
				},
				getLim: function(p){
					var
					scope = el.destScope || el.scope,
					rect = scope.getBoundingClientRect();
					p.lim = {};
					p.lim.left = rect.left;//because rect's properties are not rewritable
					p.lim.top = rect.top;//because rect's properties are not rewritable
					p.lim.right = rect.right;//because rect's properties are not rewritable
					p.lim.bottom = rect.bottom;//because rect's properties are not rewritable
				p.lim.width = scope.clientWidth;
				p.lim.height = scope.clientHeight;
				p.lim.borderX = scope.offsetWidth - scope.clientWidth;
				p.lim.borderY = scope.offsetHeight - scope.clientHeight;
				if(scope.nodeName.toLowerCase() == 'body'){
						p.lim.height = Math.max( /*document.body.scrollHeight,*/ document.body.clientHeight,  document.documentElement.clientHeight /*document.documentElement.scrollHeight, document.documentElement.offsetHeight */) - p.lim.top;
						p.lim.width = Math.max( /*document.body.scrollWidth,*/ document.body.clientWidth,  document.documentElement.clientWidth /*document.documentElement.scrollWidth, document.documentElement.offsetWidth */) - p.lim.left;
						p.lim.bottom = p.lim.height;
						p.lim.left = 0;
						p.lim.top = 0;
					}
				},
				getParents: function(p){
					p.parents = [];
					(function(par){
						p.parents.push(par);
						if(par.nodeName.toLowerCase() !== 'body'){
							arguments.callee(par.parentNode);
						}
					}(el.dragEl.parentNode));
				},
				getGrid: function(p){
					var
					i = 0,
						incX = 0,
						incY = 0,
						scope = el.destScope || el.scope;
					p.grid = {
						inc: [],
						src: [],
						stack: []
					};
					$(scope).children().filter(':visible').each(function(ii,node){
						var
							computed = window.getComputedStyle ? getComputedStyle(node, '') : node.currentStyle;
						if(node != el.dragEl){
							node.fullHeight = node.offsetHeight + parseInt(computed.marginTop,10) + parseInt(computed.marginBottom,10);
							node.fullWidth = node.offsetWidth + parseInt(computed.marginLeft,10) + parseInt(computed.marginRight,10);
							p.grid.src.push({
								x: node.offsetWidth,
								y: node.offsetHeight,
								mTop: parseInt(computed.marginTop,10),
								mLeft: parseInt(computed.marginLeft,10),
								mBotom: parseInt(computed.marginBottom,10),
								mRight: parseInt(computed.marginRight,10)
								});
								p.grid.inc.push({
									x: incX,
									y: incY
								});
								p.grid.stack.push(node);
							incX += node.fullWidth;
							incY += node.fullHeight;
								if(node == el || node == p.inserted){
									el.curIndex = i;
									if(el.initIndex === null){
										el.initIndex = i;
									}
								}
							i++;
						}
					});
				},
				checkLeftScope: function (pos, p, dest) {
					var
						left,
						reached = true;
					if (/x/.test(p.leaveScope)) {
					if(pos.x> p.lim.width + p.lim.left + p.scrLeft || pos.x + el.dragEl.offsetWidth < p.lim.left + p.scrLeft ){
							left = true;
						}
					if(pos.x + el.dragEl.offsetWidth > p.lim.width + p.lim.left + p.scrLeft || pos.x < p.lim.left + p.scrLeft ){
							reached = false;
						}
					}
					if (/y/.test(p.leaveScope)) {
					if(pos.y > p.lim.height + p.lim.top + p.scrTop  || pos.y + el.dragEl.offsetHeight < p.lim.top + p.scrTop){
							left = true;
						}
					if(pos.y + el.dragEl.offsetHeight > p.lim.height + p.lim.top + p.scrTop || pos.y  < p.lim.top + p.scrTop){
							reached = false;
						}
					}
					if (reached) {//element has completely reached scope
						if (!p.reachScope) {
							p.reachScope = true;
							if (p && p.onReachScope && typeof(p.onReachScope) == 'function') {
								p.onReachScope(el, p);
							}
						}
					} else {//element has started to go out scope
						if (p.reachScope) {
							p.reachScope = false;
							if (p && p.onLeavingScope && typeof(p.onLeavingScope) == 'function') {
								p.onLeavingScope(el, p);
							}
						}
					}
					if (left) {//element has completely left scope
						if (!p.leftScope) {
							p.leftScope = true;
							if (p && p.onLeaveScope && typeof(p.onLeaveScope) == 'function') {
								p.onLeaveScope(el, p);
							}
						}
					} else {//element has started to go over scope
						if (p.leftScope) {
							p.leftScope = false;
							if (p && p.onReachingScope && typeof(p.onReachingScope) == 'function') {
								p.onReachingScope(el, p);
							}
						}
					}
				},
				checkOriginPosition: function(pos, p){
				//TODO:check when p.sortable == 'x,y'
					if(!p || !p.sortable){
						return;
					}
					var
						u,
						uu,
						undelNamespace = '',
						undeletable,
						leftDepth = 0,
						rightDepth = 0,
						lcurrent = 0,
						rcurrent = 0,
						max = p.grid.inc.length ? p.grid.inc.length - 1 : 0,
						i = max,
						current = el.curIndex,
						delta = {//this delta should recalculate after rebuild
							x: pos.x - (el.runtime.startX - (el.runtime.shiftX + p.lim.borderX/2)),
							y: pos.y - (el.runtime.startY - (el.runtime.shiftY + p.lim.borderY/2))
						},
						src = p.inserted || el;
				if(/x/.test(p.sortable)){				
					for(i = max; i >= 0; i--){
						if(delta.x - p.overcrossing > 0){
							if(pos.x + src.offsetWidth - (p.lim.left + p.scrLeft) <= p.grid.inc[i].x + p.grid.src[i].mLeft + p.grid.src[i].x + p.overcrossing){
								if(p.grid.stack[i] == src){
									current = i ;
								}else{
									current = i ? i - 1 : i;
								}
							}
						}
						if(delta.x + p.overcrossing < 0){
							if(pos.x - (p.lim.left + p.scrLeft) <= p.grid.inc[i].x + p.grid.src[i].mLeft - p.overcrossing){
								if(p.grid.stack[i] == src){
									current = i ;
								}else{
									current = i - 1 ;
								}
							}
						}
						if(el.dragEl.isExtra){
							p.overcrossing = 0;
							// if(el.dragEl.delta.x > 0){
								// if(pos.x + el.dragEl.offsetWidth - (p.lim.left + p.scrLeft) >= p.grid.inc[i].x + p.grid.src[i].mLeft){
									// current = i  ;
									// i = 0;
								// }
							// }
							// if(el.dragEl.delta.x < 0){
								// if(pos.x - (p.lim.left + p.scrLeft) <= p.grid.inc[i].x + p.grid.src[i].mLeft + p.grid.src[i].x - p.overcrossing ){
									// current = i;
								// }
							// }
							// if(el.dragEl.delta.x == 0){
								if(pos.x + (el.dragEl.offsetWidth / 2) - (p.lim.left + p.scrLeft)  >= p.grid.inc[i].x + p.grid.src[i].mLeft  && pos.x + (el.dragEl.offsetWidth / 2) - (p.lim.left + p.scrLeft) <= p.grid.inc[i].x + p.grid.src[i].mLeft + p.grid.src[i].x){//center in some elements range
									current = i;
									i = 0;
								}else{//center is not in any element
									if(!rcurrent && pos.x + el.dragEl.offsetWidth - p.lim.left >= p.grid.inc[i].x + p.grid.src[i].mLeft && pos.x + el.dragEl.offsetWidth - (p.lim.left + p.scrLeft) <= p.grid.inc[i].x + p.grid.src[i].mLeft + p.grid.src[i].x){// right side insight
										rcurrent = i;
										rightDepth = (pos.x + el.dragEl.offsetWidth) - (p.grid.inc[i].x + p.grid.src[i].mLeft) - (p.lim.left + p.scrLeft);
									}
									if(!lcurrent && pos.x - (p.lim.left + p.scrLeft) >= p.grid.inc[i].x + p.grid.src[i].mLeft && pos.x - (p.lim.left + p.scrLeft) <= p.grid.inc[i].x + p.grid.src[i].mLeft + p.grid.src[i].x){
										lcurrent = i;										
										leftDepth =  (p.grid.inc[i].x + p.grid.src[i].mLeft + p.grid.src[i].x) - (pos.x + p.lim.left + p.scrLeft);
									}
									if(rightDepth && leftDepth){//left and right edges are inside elements 
										if(rightDepth > leftDepth){//right side is deeper inside
											current = rcurrent;
										}else{
											current = lcurrent;
										}
									}else{
										if(rightDepth){// right side insight
											current = rcurrent;
										}else{//left side inside
											current = lcurrent;
										}
									}
								}
							// }
						}
					}
					if(el.dragEl.isExtra){
						if(pos.x + el.dragEl.offsetWidth - (p.lim.left + p.scrLeft) >= p.grid.inc[max].x  + p.grid.src[max].x + p.grid.src[max].mLeft + p.overcrossing){
							current = max ;
						}
					}else{
						if(pos.x + src.offsetWidth - (p.lim.left + p.scrLeft) >= p.grid.inc[max].x  + p.grid.src[max].x + p.grid.src[max].mLeft + p.overcrossing){
							current = max;
						}
					}
					if(el.dragEl.isExtra){
						current = current > max ? max : current;
						$(el.friends).css({opacity:1}).removeClass('j_fDnDcandidate');
						if(p.undeletable){
							undelNamespace = p.undeletable.split(' ');
							uu = undelNamespace.length;
							if(uu){
								undeletable = false;
								for(u = 0; u < uu; u++){
									if($(p.grid.stack[current]).hasClass(undelNamespace[u])){
										undeletable = true;
										u = uu;
									}
								}
								if(undeletable){
									if(!p.leftScope){
										p.leftScope = true;
										if(p && p.onLeaveScope && typeof(p.onLeaveScope) == 'function'){
											p.onLeaveScope(el, p);
										}
									}
								}else{
									$(p.grid.stack[current]).addClass('j_fDnDcandidate').css({opacity:0});
									if (p.leftScope) {
										p.leftScope = false;
										if (p && p.onReachingScope && typeof(p.onReachingScope) == 'function') {
											p.onReachingScope(el, p);
										}
									}
								}
							}
						}else{
							$(p.grid.stack[current]).addClass('j_fDnDcandidate').css({opacity:0});
							if (p.leftScope) {
								p.leftScope = false;
								if (p && p.onReachingScope && typeof(p.onReachingScope) == 'function') {
									p.onReachingScope(el, p);
								}
							}
						}
						el.curIndex = current;
					}else{
						if (current != el.curIndex) {
							if (current == max) {
								src.parentNode.appendChild(src);
							} else {
								src.parentNode.insertBefore(src, p.grid.stack[current + 1]);
							}
							el.curIndex = current;
							el.runtime.startX = pos.x + el.runtime.shiftX + p.lim.borderX / 2;
							this.getGrid(p);
						}
					}
				}
				if(/y/.test(p.sortable)){
					for(i = max; i >= 0; i--){
						if(delta.y - p.overcrossing > 0){
							if(pos.y + src.offsetHeight - (p.lim.top + p.scrTop) <= p.grid.inc[i].y + p.grid.src[i].mTop + p.grid.src[i].y + p.overcrossing){
								current =  i ? i - 1 : i;
							}
						}
						if(delta.y + p.overcrossing < 0){
							if(pos.y - (p.lim.top + p.scrTop) <= p.grid.inc[i].y + p.grid.src[i].mTop - p.overcrossing){
								if(p.grid.stack[i] == src){
									current = i ;
								}else{
									current = i - 1 ;
								}
								}
							}
						}
					if(pos.y  + src.offsetHeight - (p.lim.top + p.scrTop) >= p.grid.inc[max].y  + p.grid.src[max].y + p.grid.src[max].mTop + p.overcrossing){
						current = max;
						}
						if(current != el.curIndex){
						if(current == max){
								src.parentNode.appendChild(src);
							}else{
							src.parentNode.insertBefore(src, p.grid.stack[current + 1]);
						}
							el.curIndex = current;
						el.runtime.startY = pos.y + el.runtime.shiftY + p.lim.borderY/2;
							this.getGrid(p);
						}
					}
				},
				toRange: function(val, p, axis){
					if(!p || !p.scope){
						if(axis){
							return val[axis];
						}
							return val;
					}
				var
					result = {//we dont use val, because we should have abillity not to rewrite it
						x: val.x,
						y: val.y
					};
				if(p.lim.left + p.scrLeft > val.x){//left edge excessing
					result.x = p.lim.left + p.scrLeft;
					}
				if(p.lim.left + p.scrLeft + p.lim.width + p.lim.borderX/2 - el.dragEl.offsetWidth < val.x){//right edge excessing
						result.x = p.lim.left + p.scrLeft + p.lim.width + p.lim.borderX / 2 - el.dragEl.offsetWidth;
					}
				if(p.lim.top + p.scrTop > val.y){//top edge excessing
					result.y = p.lim.top + p.scrTop;
					}
				if(p.lim.top + p.scrTop + p.lim.height + p.lim.borderY/2 - el.dragEl.offsetHeight < val.y){//bottom edge excessing
					result.y = p.lim.top + p.scrTop + p.lim.height + p.lim.borderY/2 - el.dragEl.offsetHeight;
				}
				if(axis){
					return result[axis];
				}
				return result;
				},
				inRange: function(val, p, x){
				if(!p || !p.scope){
						return true;
					}
					if(x){
						if(/x/.test(p.leaveScope)){
							return true;
						}
						return(p.lim.left + p.scrLeft <= val.x && p.lim.left + p.scrLeft + p.lim.width - p.lim.borderX >= val.x + el.dragEl.offsetWidth);
					}else{
						if(/y/.test(p.leaveScope)){
							return true;
						}
						return(p.lim.top + p.scrTop <= val.y && p.lim.top + p.scrTop + p.lim.height - p.lim.borderY >= val.y + el.dragEl.offsetHeight);
					}	
				},
				tryMagnetic: function(val, p) {
					var
						joined = p.magnetic.joined || {
							top: false,
							left: false,
							right: false,
							bottom: false
						},
						targets = p.magnetic.targets;
					if (targets.length) {
						var
							result = {
								x: val.x,
								y: val.y
							},
							i = 0,
							l = targets.length,
							target, sameTarget, sensitivity, targetBox, xCentered, yCentered, topEdge, leftEdge, rightEdge, bottomEdge, isParent, tBox;
						for (i; i < l; i++) {
							target = (targets[i].target && targets[i].target.parentNode) ? targets[i].target : false;
							if (target) {
								sensitivity = targets[i].sensitivity || p.sensitivity;
								targetBox = target.getBoundingClientRect();//is not rewritable object
								tBox = {//to have ability change values
									top: targetBox.top,
									left: targetBox.left,
									right: targetBox.right,
									bottom: targetBox.bottom,
								}; 
								isParent = (p.parents && p.parents.length && p.parents.indexOf(target) !== -1); //current target is one of parentNodes of draggable element
								joined.isParent = isParent;
								if (target.nodeName.toLowerCase() == 'body') {
									tBox.bottom = Math.max(/*document.body.scrollHeight,*/ document.body.clientHeight,  document.documentElement.clientHeight /*document.documentElement.scrollHeight, document.documentElement.offsetHeight */) - p.lim.top;;
								}
									//edges logic: if .target is one of parents of draggable element- we check same named edges. if no- we compare appart edges
								if (Math.abs(val.y - p.scrTop - (isParent ? tBox.top : tBox.bottom)) > sensitivity) {
									topEdge = false;
								} else {
									topEdge = isParent ? tBox.top : tBox.bottom;
								}
								if (Math.abs(val.x - p.scrLeft - (isParent ? tBox.left : tBox.right)) > sensitivity) {
									leftEdge = false;
								} else {
									leftEdge = isParent ? tBox.left : tBox.right;
								}
								if (Math.abs(val.x + el.dragEl.offsetWidth - p.scrLeft - (isParent ? tBox.right : tBox.left)) > sensitivity) {
									rightEdge = false;
								} else {
									rightEdge = isParent ? tBox.right : tBox.left;
								}
								if (Math.abs(val.y + el.dragEl.offsetHeight - p.scrTop - (isParent ? tBox.bottom : tBox.top)) > sensitivity) {
									bottomEdge = false;
								} else {
									bottomEdge = isParent ? tBox.bottom : tBox.top;
								}								
								xCentered = Math.abs((tBox.left + (tBox.right - tBox.left) / 2) - (val.x + el.dragEl.offsetWidth / 2) /*+p.scrLeft*/) > sensitivity ? false : tBox.left + (tBox.right - tBox.left) / 2 - (el.dragEl.offsetWidth / 2 + p.scrLeft);
								yCentered = Math.abs((tBox.top + (tBox.bottom - tBox.top) / 2) - (val.y + el.dragEl.offsetHeight / 2) /*+p.scrTop*/) > sensitivity ? false : tBox.top + (tBox.bottom - tBox.top) / 2 - (el.dragEl.offsetHeight / 2 + p.scrTop);
								xCommons = ((val.x - p.scrLeft) < tBox.right) && ((val.x + el.dragEl.offsetWidth - p.scrLeft) > tBox.left);
								yCommons = ((val.y - p.scrTop) < tBox.bottom) && ((val.y + el.dragEl.offsetHeight - p.scrTop) > tBox.top);
								sameTarget = (!joined.top || joined.top == target) && (!joined.left || joined.left == target) && (!joined.right || joined.right == target) && (!joined.bottom || joined.bottom == target);
								
								if (sameTarget) {//we reject have different attached targets	
									if (topEdge !== false && xCommons) {//distance between top edge of draggable target and top/bottom edge of one of magnetic targets
										result.y = (isParent ? tBox.top : tBox.bottom) + p.scrTop;
										if (typeof(targets[i].onJoin) == 'function' && !joined.top) {
											joined.top = target;//don't  get assigning of joined value before of this checker
											targets[i].onJoin(el, p, 'top');
										}
										joined.top = target;//for the case if previous block wasn't runned
										if (targets[i].alignment && targets[i].alignment.top && leftEdge === false && rightEdge === false) {//alignment (position adjustment)
											if (targets[i].alignment.top == 'center' && xCentered !== false) {
												result.x = xCentered;
											}
										}
									} else {
										if (typeof(targets[i].onDetach) == 'function' && joined.top) {
											joined.top = false;
											targets[i].onDetach(el, p, 'top');
										}
										joined.top = false;
									}
									
									if (leftEdge !== false && yCommons) {
										result.x = (isParent ? tBox.left : tBox.right) + p.scrLeft;
										if (typeof(targets[i].onJoin) == 'function' && !joined.left) {
											joined.left = target;
											targets[i].onJoin(el, p, 'left');
										}
										joined.left = target;
										if (targets[i].alignment && targets[i].alignment.left && topEdge === false && bottomEdge === false) {
											if (targets[i].alignment.left == 'center' && yCentered !== false) {
												result.y = yCentered;
											}
										}
									} else {
										if (typeof(targets[i].onDetach) == 'function' && joined.left) {
											joined.left = false;
											targets[i].onDetach(el, p, 'left');
										}
										joined.left = false;
									}
									
									if (rightEdge !== false && yCommons) {
										result.x = (isParent ? tBox.right : tBox.left) - el.dragEl.offsetWidth + p.scrLeft;
										if (typeof(targets[i].onJoin) == 'function' && !joined.right) {
											joined.right = target;
											targets[i].onJoin(el, p, 'right');
										}
										joined.right = target;
										if (targets[i].alignment && targets[i].alignment.right && topEdge === false && bottomEdge === false) {
											if (targets[i].alignment.right == 'center' && yCentered !== false) {
												result.y = yCentered;
											}
										}
									} else {
										if (typeof(targets[i].onDetach) == 'function' && joined.right) {
											joined.right = false;
											targets[i].onDetach(el, p, 'right');
										}
										joined.right = false;
									}
									
									if (bottomEdge !== false && xCommons) {
										result.y = (isParent ? tBox.bottom : tBox.top) - el.dragEl.offsetHeight + p.scrTop;
										if (typeof(targets[i].onJoin) == 'function' && !joined.bottom) {
											joined.bottom = target;
											targets[i].onJoin(el, p, 'bottom');
										}
										joined.bottom = target;
										if (targets[i].alignment && targets[i].alignment.bottom && leftEdge === false && rightEdge === false) {
											if (targets[i].alignment.bottom == 'center' && xCentered !== false) {
												result.x = xCentered;
											}
										}
									} else {
										if (typeof(targets[i].onDetach) == 'function' && joined.bottom) {
											joined.bottom = false;
											targets[i].onDetach(el, p, 'bottom');
										}
										joined.bottom = false;
									}
								}
							}
						}
						p.magnetic.joined = joined;
						return result;
					}
					return val;
				},
				moveAt: function(e, p, ultimate){
					var
						pos = {
							x: e.pageX - el.runtime.shiftX - p.lim.borderX/2,
							y: e.pageY - el.runtime.shiftY - p.lim.borderY/2
						},
					posRel = function(){
						return {
							x: pos.x + el.parentNode.scrollLeft,
							y: pos.y + el.parentNode.scrollTop
							};
					};
					this.getLim(p);
					p.scrTop = $window.scrollTop();
					p.scrLeft = $window.scrollLeft();
					if ((ultimate || !p.scope) && !el.destScope) {
						if(p.scope){
							pos = this.toRange(pos, p);
						}
						el.dragEl.style.left = pos.x + 'px';
						el.dragEl.style.top = pos.y + 'px';
						return;
					}
					if(p.leaveScope){
						this.checkLeftScope(posRel(), p);
					}
					if(!p.leftScope){
						this.checkOriginPosition(posRel(), p);
					}else{
						$(el.friends).css({ opacity: 1 }).removeClass('j_fDnDcandidate');
					}
					if (!this.inRange(pos, p, true)) {
						pos.x = this.toRange(pos, p, 'x');
					}
					if (!this.inRange(pos, p)) {
						pos.y = this.toRange(pos, p, 'y');
					}
					if (p.magnetic) {
						pos = this.tryMagnetic(pos, p);
					}
					el.dragEl.style.left = pos.x + 'px';
					el.dragEl.style.top = pos.y + 'px';
					el.dragEl.delta = {
						x: pos.x - (el.dragEl.runtime ? el.dragEl.runtime.x : 0),
						y: pos.y - (el.dragEl.runtime ? el.dragEl.runtime.y : 0)
					};
					el.dragEl.runtime = el.dragEl.runtime || {};
					el.dragEl.runtime.y = pos.y;
					el.dragEl.runtime.x = pos.x;
				},
				getCoords: function(node){
					var 
						n = node || el,
						box = n.getBoundingClientRect();					
					return {
						top: box.top + pageYOffset,
						left: box.left + pageXOffset,
					right: box.right,
					bottom: box.bottom,
						width: n.clientWidth,
						height: n.clientHeight,
						borderX: n.offsetWidth - n.clientWidth,
						borderY: n.offsetHeight - n.clientHeight
					};
				}
			};
		},
		SbmFreeDrag: function(p){
			return this.each(function(){
				var
					$el = $(this),
					el = this,
					lock,
					ll,
					l = 0,
					mouseDown = function(e){
						if (!window.SFDCaptured) {
						$(window)
							.off('mouseup touchend', mouseUp)
							.on('mouseup touchend', mouseUp)
							.off('mousemove touchmove', mouseMove)
							.on('mousemove touchmove', mouseMove)
							.off('setDragScope', setDragScope)
							.on('setDragScope', setDragScope)
							.off('removeDragScope', removeDragScope)
							.on('removeDragScope', removeDragScope);
							
						if(e.originalEvent && e.originalEvent.targetTouches && e.originalEvent.targetTouches[0]){
							p.isTouch = true;
						}
						if(p.lock){
							lock = p.lock.split(' ');
							ll = lock.length;
							if(ll){
								for(l = 0; l < ll; l++){
									if($el.hasClass(lock[l])){
										return;
									}
								}
							}
						}
						if(p.isTouch){
							e.pageX = e.originalEvent.targetTouches[0].pageX;
							e.pageY = e.originalEvent.targetTouches[0].pageY;
							setTimeout(function(){
								e.preventDefault();
								if(!p.touchDrag){
									p.touchDrag = 1;//0-touchend; 1-long tap; 2-scroll; 
									el.ableToDrag = true;
								}
							},300);
						}else{
							el.ableToDrag = true;
						}
						el.runtime = {
							pageX: e.pageX,
							pageY: e.pageY
							};
						window.SFDCaptured = true;
						$('iframe').css('pointer-events', 'none');
						if(p.isTouch){
							$('body').addClass('s_noselect');
							}
						}
					},
					mouseMove = function(e){
						if(p.isTouch){
							if(p.touchDrag == 1){
								e.preventDefault();
							}else{
								p.touchDrag = 2;
							}
						}
						if(el.ableToDrag){
							if(e.originalEvent && e.originalEvent.targetTouches && e.originalEvent.targetTouches[0]){
								e.pageX = e.originalEvent.targetTouches[0].pageX;
								e.pageY = e.originalEvent.targetTouches[0].pageY;
							}
						var
							delta = {
								x: Math.abs(e.pageX - el.runtime.pageX),
								y: Math.abs(e.pageY - el.runtime.pageY)
							};
						if(el.dragStarted){
							$(el).FD_().moveAt(e, p);
						}else{
							if(delta.x <= p.sensitivity && delta.y <= p.sensitivity){
								return;
							}
								if(p.isTouch){
									if(p.touchDrag == 1){//long tap
										$(el).FD_().start(e,p);
									}
								}else{
									$(el).FD_().start(e,p);
								}
							if(p && p.onDragStart && typeof(p.onDragStart) == 'function'){
								p.onDragStart(el, p);
							}
							if(p.defferedMove){
									if(p.isTouch){
										if(p.touchDrag == 1){//long tap
											$(el).FD_().moveAt(p.defferedMove, p, true);
										}
									}else{
										$(el).FD_().moveAt(p.defferedMove, p, true);	
									}
								}
							}
							if(p.isTouch && p.touchDrag == 1){
								return false;
							}
						}
					},
					mouseUp = function(){
					var
						$extraEl = $('.j_fDnDcandidate'),
						extraEl = $extraEl[0];
					if(el.ableToDrag){
						el.ableToDrag = false;
						p.defferedMove = false;
						el.style.opacity = 1;
						el.replacedWithExtra = false;
						if(el.dragEl && el.dragEl.isExtra){
							if(extraEl){//DnD is placed in scope
								p.$extraElData = $extraEl.data();
								$(p.inserted).removeClass('s_minimized s_noboard');
								extraEl.parentNode.replaceChild(p.inserted, extraEl);
								el.replacedWithExtra = true;
							}else{
								if(p.inserted){
								p.inserted.parentNode.removeChild(p.inserted);
								p.inserted = null;
								}
							}
						}
						if(el.dragStarted){
						if(el.dragEl && el.dragEl.parentNode && !p.trueDrag){
								el.dragEl.parentNode.removeChild(el.dragEl);
							}
							el.dragEl = null;
							el.friends = null;
							el.dragStarted = false;

							//This trick was added because FF fires click event just after mouseup and always runs the menu item after dragging.
							//Inspired by http://stackoverflow.com/questions/1771627/preventing-click-event-with-jquery-drag-and-drop#answer-1771635
							setTimeout(function(){
								$el.unbind("click.prevent");
							}, 300);
							if(p && p.onDragEnd && typeof(p.onDragEnd) == 'function'){
								p.onDragEnd(el,p);
							}
						}
						p.inserted = null;
						if(p.isTouch){
							$('body').removeClass('s_noselect');
						}
					}
					p.isTouch = false;
					p.touchDrag = 0;
					$('iframe').css('pointer-events', 'auto');
					$(document.body).children().removeClass('s_noselect');
					if(window.SFDCaptured){
						window.SFDCaptured = false;
						}
					},
					setDragScope = function(e,data){
						if(el.ableToDrag){
							$(el).FD_().restart(p,data);
						}
					},
					removeDragScope = function(e,data){
						if(el.ableToDrag){
							el.destScope = null;
							//...
						}
					};
			$el
				.off('mousedown touchstart', mouseDown)
				.on('mousedown touchstart', mouseDown);
			});
		}
	});

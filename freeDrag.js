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
				window.top.document.body.appendChild(el.dragEl);
				if(typeof(d.dragMod) == 'function'){
					d.dragMod(el.dragEl);
				}
				if(d.maxItems !== undefined){
					p.maxItems = d.maxItems;
				}
				if(d.insert){
					p.inserted = (d && d.nsrc) ? d.nsrc : el.dragEl.cloneNode();
					if(p.maxItems !== undefined && el.friends && el.friends.length){
						if(p.maxItems <= el.friends.length){
							el.dragEl.isExtra = true;
							$(p.inserted).addClass('s_minimized s_noboard');
						}
					}
					el.destScope.appendChild(p.inserted);
					if(typeof(d.srcMod) == 'function'){
						d.srcMod(p.inserted,el.dragEl);
					}
				}
				p.leftScope = true;
				p.lim = this.getCoords(d.scope);
				if(el.destScope.nodeName.toLowerCase() == 'body'){
					p.lim.left = 0;
					p.lim.top = 0;
				}
				if(p.sortable){
					this.getGrid(p);
				}
				if(typeof(d.srcPasted) == 'function'){
					d.srcPasted(p.inserted);
				}
				if(d.center){
					el.runtime.shiftX = el.dragEl.clientWidth/2;
					el.runtime.shiftY = el.dragEl.clientHeight/2;
				}
				$el.FD_().moveAt({
					pageX: el.runtime.startX - p.lim.left,
					pageY: el.runtime.startY - p.lim.top}, p, true);
			},
			start: function(e,p){
				var
					coords,
					computed = getComputedStyle(el);
				p.overcrossing = p.overcrossing || 0;
				p.sensitivity = p.sensitivity || 1;
				el.scope = (p && p.scope) ? p.scope == 'parent' ? el.parentNode : p.scope.length ? p.scope[0] : p.scope : window.top.document.body;
				this.getLim(p);
				coords = this.getCoords();
				el.fullHeight = el.offsetHeight + parseInt(computed.marginTop,10) + parseInt(computed.marginBottom,10);
				el.fullWidth = el.offsetWidth + parseInt(computed.marginLeft,10) + parseInt(computed.marginRight,10);
				el.runtime.shiftX = e.pageX - coords.left;//e.offsetX
				el.runtime.shiftY= e.pageY - coords.top;//e.offsetY	
				el.runtime.startX= e.pageX;
				el.runtime.startY= e.pageY;
				el.initIndex = null;
				el.dragEl = p && p.ndrgel ? p.ndrgel : el.cloneNode();
				el.$dragEl = $(el.dragEl);
				el.dragEl.innerHTML = el.innerHTML;
				window.top.document.body.appendChild(el.dragEl);
				el.dragEl.origin = el;
				el.dragEl.className = el.dragEl.className.replace(/(s|j)_[^\s]*/igm,'');
				if(p.sortable){
					this.getGrid(p);
					el.$dragEl.css({
						'width': el.clientWidth + 'px',
						'height': el.clientHeight + 'px'
					});
				}
				p.defferedMove = e;
				el.$dragEl.css({
					'zIndex': 1000,
					'position': 'absolute',
					'margin': '0px'
				});
				if(!p.sourceCopy){
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
					p.lim.left = 0;
					p.lim.top = 0;
				}
				
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
			$(scope).children().each(function(ii,node){
					var
						computed = getComputedStyle(node);
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
			checkLeftScope: function(pos, p, dest){
				var
					left,
					reached = true;
				if(/x/.test(p.leaveScope)){
					if(pos.x> p.lim.width + p.lim.left + p.scrLeft || pos.x + el.dragEl.offsetWidth < p.lim.left + p.scrLeft ){
						left = true;
					}
					if(pos.x + el.dragEl.offsetWidth > p.lim.width + p.lim.left + p.scrLeft || pos.x < p.lim.left + p.scrLeft ){
						reached = false;
					}
				}
				if(/y/.test(p.leaveScope)){
					if(pos.y > p.lim.height + p.lim.top + p.scrTop  || pos.y + el.dragEl.offsetHeight < p.lim.top + p.scrTop){
						left = true;
					}
					if(pos.y + el.dragEl.offsetHeight > p.lim.height + p.lim.top + p.scrTop || pos.y  < p.lim.top + p.scrTop){
						reached = false;
					}
				}
				if(reached){//element has completely reached scope
					if(!p.reachScope){
						p.reachScope = true;
						if(p && p.onReachScope && typeof(p.onReachScope) == 'function'){
							p.onReachScope(el, p);
						}
					}
				}else{//element has started to go out scope
					if(p.reachScope){
						p.reachScope = false;
						if(p && p.onLeavingScope && typeof(p.onLeavingScope) == 'function'){
							p.onLeavingScope(el, p);
						}
					}
				}
				if(left){//element has completely left scope
					if(!p.leftScope){
						p.leftScope = true;
						if(p && p.onLeaveScope && typeof(p.onLeaveScope) == 'function'){
							p.onLeaveScope(el, p);
						}
					}
				}else{//element has started to go over scope
					if(p.leftScope){
						p.leftScope = false;
						if(p && p.onReachingScope && typeof(p.onReachingScope) == 'function'){
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
					max = el.dragEl.isExtra ? p.grid.inc.length - 2 : p.grid.inc.length - 1,
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
						}
						el.curIndex = current;
					}else{
						if(current != el.curIndex){
							if(current == max){
									src.parentNode.appendChild(src);
							}else{
								src.parentNode.insertBefore(src, p.grid.stack[current + 1]);
							}
							el.curIndex = current;
							el.runtime.startX = pos.x + el.runtime.shiftX + p.lim.borderX/2;
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
					result.x = p.lim.left + p.scrLeft + p.lim.width + p.lim.borderX/2 - el.dragEl.offsetWidth
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
			moveAt: function(e, p, ultimate){
				var
					pos = {
						x: e.pageX - el.runtime.shiftX - p.lim.borderX/2,
						y: e.pageY - el.runtime.shiftY - p.lim.borderY/2
					};
				this.getLim(p);
				p.scrTop = $window.scrollTop();
				p.scrLeft = $window.scrollLeft();
				if((ultimate || !p.scope) && !el.destScope){
					if(p.scope){
						pos = this.toRange(pos, p);
					}
					el.dragEl.style.left = pos.x + 'px';
					el.dragEl.style.top = pos.y + 'px';
					return;
				}
				if(p.leaveScope){
					this.checkLeftScope(pos, p);
				}
				if(!p.leftScope){
					this.checkOriginPosition(pos, p);
				}else{
					$(el.friends).css({opacity:1}).removeClass('j_fDnDcandidate')
				}
				if(this.inRange(pos, p, true)){
					el.dragEl.style.left = pos.x + 'px';
				}else{
					pos.x = this.toRange(pos, p, 'x');
					el.dragEl.style.left = pos.x + 'px';
				}
				if(this.inRange(pos, p)){
					el.dragEl.style.top = pos.y + 'px';
				}else{
					pos.y = this.toRange(pos, p, 'y');
					el.dragEl.style.top = pos.y + 'px';
				}
				el.dragEl.delta = {
					x: pos.x - (el.dragEl.runtime ? el.dragEl.runtime.x : 0),
					y: pos.y - (el.dragEl.runtime ? el.dragEl.runtime.y : 0)
				}
				el.dragEl.runtime = pos;
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
		}
	},
	SbmFreeDrag: function(p){
		return this.each(function(){
			var
				$el = $(this),
					el = this,
					lock,
					ll,
					l = 0;
				$el.on('mousedown touchstart',function(e){
					if(!window.SFDCaptured){
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
					}
					window.SFDCaptured = true;
					$('iframe').css('pointer-events', 'none');
						if(p.isTouch){
							$('body').addClass('s_noselect');
				}
					}
			});
			$(window.top)
				.on('mouseup touchend',function(){
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
						if(el.dragEl && el.dragEl.parentNode){
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
							p.onDragEnd(el, p);
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
			})
				.on('mousemove touchmove',function(e){
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
			})
			.on('setDragScope',function(e,data){
				if(el.ableToDrag){
					$(el).FD_().restart(p,data);
				}
			})
			.on('removeDragScope',function(e,data){
				if(el.ableToDrag){
					el.destScope = null;
					//...
				}
			});
		});
	}
});
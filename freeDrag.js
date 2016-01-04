$.fn.extend({
	FD_: function(){
		var 
			$el = this,
			el = this[0];
		return {
			restart: function(p){
				var
					coords = this.getCoords(p.destScope);
				
				console.log(p,el.parentNode.childNodes)
			},
			start: function(e,p){
				var
					coords;
				p.overcrossing = p.overcrossing || 0;
				p.sensitivity = p.sensitivity || 0;
				el.scope = (p && p.scope) ? p.scope == 'parent' ? el.parentNode : p.scope.length ? p.scope[0] : p.scope : window.top.document.body;
				this.getLim(p);
				coords = this.getCoords();
				el.runtime.shiftX = e.pageX - coords.left,//e.offsetX
				el.runtime.shiftY= e.pageY - coords.top;//e.offsetY	
				el.runtime.startX= e.pageX;
				el.runtime.startY= e.pageY;
				el.dragEl = el.cloneNode();
				el.$dragEl = $(el.dragEl);
				el.dragEl.innerHTML = el.innerHTML;
				el.scope.appendChild(el.dragEl);
				el.dragEl.className = el.dragEl.className.replace(/(s|j)_[^\s]*/igm,'');
				if(p.sortable){
					this.getGrid(p);
					el.$dragEl.css({
						'width': el.clientWidth + 'px',
						'height': el.clientHeight + 'px'
					});
				}
				this.moveAt(e, p, true);
				el.$dragEl.css({
					'zIndex': 1000,
					'position': 'absolute',
					'margin': '0px'
				});
				if(!p.sourceCopy){
					el.style.opacity = 0;
				}
				el.dragStarted = true;
				$(document.body).children().addClass('s_noselect');
			},
			getLim: function(p){
				var
					rect = el.scope.getBoundingClientRect();
				p.lim = {};
				p.lim.left = rect.left;//because rect's properties are not rewritable
				p.lim.top = rect.top;//because rect's properties are not rewritable
				p.lim.right = rect.right;//because rect's properties are not rewritable
				p.lim.bottom = rect.bottom;//because rect's properties are not rewritable
				p.lim.width = el.scope.clientWidth;
				p.lim.height = el.scope.clientHeight;
				p.lim.borderX = el.scope.offsetWidth - el.scope.clientWidth;
				p.lim.borderY = el.scope.offsetHeight - el.scope.clientHeight;
				if(!p.scope){//for document.body
					p.lim.left = 0;
					p.lim.top = 0;
				}
				
			},
			getGrid: function(p){
				var
					incX = 0,
					incY = 0;
				p.grid = {
					inc: [],
					src: [],
					stack: []
				};
			$(el.scope).children().each(function(i,node){
					if(node != el.dragEl){
						p.grid.src.push({
							x: node.clientWidth,
							y: node.clientHeight
						});
						p.grid.inc.push({
							x: incX,
							y: incY
						});
						p.grid.stack.push(node);
						incX += node.clientWidth;
						incY += node.clientHeight;
						if(node == el){
							el.intIndex = i;
						}
					}
				});
			},
			checkLeftScope: function(pos, p, dest){
				var
					left;
				if(/x/.test(p.leaveScope)){
					if(pos.x + p.lim.left > p.lim.right){
						left = true;
					}
				}
				if(/y/.test(p.leaveScope)){
					if(pos.y + p.lim.top > p.lim.bottom){
						left = true;
					}
				}
				if(left){
					if(!p.leftScope){
						if(p && p.onLeaveScope && typeof(p.onLeaveScope) == 'function'){
							p.onLeaveScope(el, el.dargEl);
						}
						p.leftScope = true;
					}
				}else{
					if(p.leftScope){
						if(p && p.onReachScope && typeof(p.onReachScope) == 'function'){
							p.onReachScope(el, el.dargEl);
						}
						p.leftScope = false;
					}
				}
			},
			checkOriginPosition: function(pos, p){
				if(!p || !p.sortable){
					return;
				}
				var
					l = p.grid.inc.length,
					i = l - 1,
					current = el.intIndex,
					delta;
				if(/x/.test(p.sortable)){
					//...
				}
				if(/y/.test(p.sortable)){
					delta = pos.y - el.runtime.startY
					// console.log(pos.y , el.runtime.startY)
					if(delta - p.overcrossing > 0){
						// console.log('+')
						for(i; i >= 0; i--){
							if(pos.y + el.clientHeight <= p.grid.inc[i].y + p.grid.src[i].y + p.overcrossing){
								current = i ;
							}
						}
					}
					if(delta + p.overcrossing < 0){
						// console.log('-')
						for(i; i >= 0; i--){
							if(pos.y <= p.grid.inc[i].y - p.overcrossing){
								current = i;
							}
						}
					}
					if(pos.y  + el.clientHeight >= p.grid.inc[l - 1].y  + p.grid.src[l - 1].y + p.overcrossing){
						current = l;
					}
					if(current != el.intIndex){
						if(current == l){
							el.parentNode.appendChild(el);
						}else{
							el.parentNode.insertBefore(el, p.grid.stack[current]);
						}
						el.intIndex = current;
						el.runtime.startY = pos.y;
						this.getGrid(p);
					}
				}
			},
			toRange: function(val, p){
				if(!p || !p.scope || p.leaveScope){
					return val;
				}
				if(p.lim.left > val.x){
					val.x = p.lim.left
				}
				if(p.lim.left + p.lim.width - p.lim.borderX - el.dragEl.clientWidth < val.x){
					val.x = p.lim.left + p.lim.width - p.lim.borderX - el.dragEl.clientWidth
				}
				if(p.lim.top > val.y){
					val.y = p.lim.top;
				}
				if(p.lim.top + p.lim.height - p.lim.borderY - el.dragEl.clientHeight < val.y){
					val.y = p.lim.top + p.lim.height - p.lim.borderY - el.dragEl.clientHeight;
				}				
				return val;
			},
			inRange: function(val, p, x){
				if(!p || !p.scope || p.leaveScope){
					return true;
				}
				if(x){
					return(p.lim.left <= val.x && p.lim.left + p.lim.width - p.lim.borderX >= val.x + el.dragEl.clientWidth);
				}else{
					return(p.lim.top <= val.y && p.lim.top + p.lim.height - p.lim.borderY >= val.y + el.dragEl.clientHeight);	
				}
			},
			moveAt: function(e, p, ultimate){
				var
					pos = {
						x: e.pageX - el.runtime.shiftX - p.lim.left + p.lim.borderX,
						y: e.pageY - el.runtime.shiftY - p.lim.top + p.lim.borderY
					};
					// console.log(p)
				if(ultimate || !p.scope){
					if(p.scope){
						pos = this.toRange(pos, p);
					}
					el.dragEl.style.left = pos.x + 'px';
					el.dragEl.style.top = pos.y + 'px';
					return;
				}
				if(this.inRange(pos, p, true)){
					el.dragEl.style.left = pos.x + 'px';
				}
				if(this.inRange(pos, p)){
					el.dragEl.style.top = pos.y + 'px';
				}
				if(!p.leftScope){
					this.checkOriginPosition(pos, p);
				}
				if(p.leaveScope){
					this.checkLeftScope(pos, p);
				}
			},
			getCoords: function(node){
				var 
					n = node || el,
					box = n.getBoundingClientRect();					
				return {
					top: box.top + pageYOffset,
					left: box.left + pageXOffset,
					right: box.right/*+- pageXOffset*/,
					bottom: box.bottom/*+- pageYOffset*/,
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
				el = this;
			$el.on('mousedown',function(e){
				if(!window.SFDCaptured){
					el.ableToDrag = true;
					el.runtime = {
						pageX: e.pageX,
						pageY: e.pageY
					}
					window.SFDCaptured = true;
				}
			});
			$(window.top)
			.on('mouseup',function(){
				if(el.ableToDrag){
					el.ableToDrag = false;
					el.style.opacity = 1;
					if(el.dragStarted){
						el.dragEl.parentNode.removeChild(el.dragEl);
						el.dragEl = null;
					}
					el.dragStarted = false;
					if(p && p.onDragEnd && typeof(p.onDragEnd) == 'function'){
						p.onDragEnd(el);
					}
				}
				if(window.SFDCaptured){
					window.SFDCaptured = false;
				}
			})
			.on('mousemove',function(e){
				if(el.ableToDrag){
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
						$(el).FD_().start(e,p);
						if(p && p.onDragStart && typeof(p.onDragStart) == 'function'){
							p.onDragStart(el.dragEl);
						}
					}
				}
			})
			.on('setDragScope',function(e,data){
				if(el.ableToDrag){
					p.destScope = data;
					$(el).FD_().restart(p);
				}
			})
			.on('removeDragScope',function(e,data){
				if(el.ableToDrag){
					p.destScope = null;
					//...
				}
			});
		});
	}
});
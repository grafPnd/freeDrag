$.fn.extend({
	FD_: function(){
		var 
			$el = this,
			el = this[0];
		return {
			restart: function(p,d){
				var
					pos = {
						x: 0,
						y: 0
					}
				el.destScope = d.scope;
				p.sortable = d.sortable;
				el.destScope.appendChild(el.dragEl);
				if(typeof(d.dragMod) == 'function'){
					d.dragMod(el.dragEl);
				}
				if(d.center){
					el.runtime.shiftX = el.dragEl.clientWidth/2;
					el.runtime.shiftY = el.dragEl.clientHeight/2;
				}
				if(d.insert){
					p.inserted = el.dragEl.cloneNode();
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
				el.dragEl.style.left = el.runtime.startX - el.runtime.shiftX - p.lim.left - p.lim.borderX/2 + 'px';
				el.dragEl.style.top = el.runtime.startY - el.runtime.shiftY - p.lim.top - p.lim.borderY/2 + 'px';
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
				el.dragEl.origin = el;
				el.dragEl.className = el.dragEl.className.replace(/(s|j)_[^\s]*/igm,'');
				if(p.sortable){
					this.getGrid(p);
					el.$dragEl.css({
						'width': el.offsetWidth + 'px',
						'height': el.offsetHeight + 'px'
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
				if(el.scope.nodeName.toLowerCase() == 'body'){
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
					if(node != el.dragEl){
						p.grid.src.push({
							x: node.offsetWidth,
							y: node.offsetHeight
						});
						p.grid.inc.push({
							x: incX,
							y: incY
						});
						p.grid.stack.push(node);
						incX += node.offsetWidth;
						incY += node.offsetHeight;
						if(node == el || node == p.inserted){
							el.intIndex = i;
						}
						i++;
					}
				});
			},
			checkLeftScope: function(pos, p, dest){
				var
					left;
				if(/x/.test(p.leaveScope)){
					if(pos.x > p.lim.width || pos.x + el.dragEl.offsetWidth < 0){
						left = true;
					}
				}
				if(/y/.test(p.leaveScope)){
					if(pos.y + el.dragEl.offsetHeight < 0 || pos.y > p.lim.height){
						left = true;
					}
				}
				if(left){
					if(!p.leftScope){
						p.leftScope = true;
						if(p && p.onLeaveScope && typeof(p.onLeaveScope) == 'function'){
							p.onLeaveScope(el, p);
						}
					}
				}else{
					if(p.leftScope){
						p.leftScope = false;
						if(p && p.onReachScope && typeof(p.onReachScope) == 'function'){
							p.onReachScope(el, p);
						}
					}
				}
			},
			checkOriginPosition: function(pos, p){
				if(!p || !p.sortable){
					return;
				}
				var
					max = p.grid.inc.length - 1,
					i = max,
					current = el.intIndex,//index of opaque element
					delta,
					src = p.inserted || el;
				if(/x/.test(p.sortable)){
					//...
				}
				if(/y/.test(p.sortable)){
					delta = pos.y - (el.runtime.startY - (el.runtime.shiftY + p.lim.top + p.lim.borderY/2));
					if(delta - p.overcrossing > 0){
						for(i; i >= 0; i--){
							if(pos.y + src.offsetHeight <= p.grid.inc[i].y + p.grid.src[i].y + p.overcrossing){
								current = i - 1;
							}
						}
					}
					if(delta + p.overcrossing < 0){
						for(i; i >= 0; i--){
							if(pos.y <= p.grid.inc[i].y - p.overcrossing){
								current = i ;
							}
						}
					}
					if(pos.y  + src.offsetHeight >= p.grid.inc[max].y  + p.grid.src[max].y + p.overcrossing){
						current = max;
					}
					if(current  != el.intIndex){
						if(current == max){
							src.parentNode.appendChild(src);
						}else{
							if(delta - p.overcrossing > 0){
								src.parentNode.insertBefore(src, p.grid.stack[current + 1]);
							}
							if(delta - p.overcrossing < 0){
								src.parentNode.insertBefore(src, p.grid.stack[current]);
							}
						}
						el.intIndex = current;
						el.runtime.startY = pos.y + el.runtime.shiftY + p.lim.top + p.lim.borderY/2;
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
				if(el.scope == el.dragEl.parentNode){
					if(0 > val.x){
						val.x = 0;
					}
					if(p.lim.width - el.dragEl.offsetWidth < val.x){
						val.x = p.lim.width - el.dragEl.offsetWidth
					}
					if(0 > val.y){
						val.y = 0;
					}
					if(p.lim.height - el.dragEl.offsetHeight < val.y){
						val.y = p.lim.height - el.dragEl.offsetHeight;
					}
				}else{
					if(p.lim.left > val.x){
						val.x = p.lim.left;
					}
					if(p.lim.left + p.lim.width + p.lim.borderX/2 - el.dragEl.offsetWidth < val.x){
						val.x = p.lim.left + p.lim.width + p.lim.borderX/2 - el.dragEl.offsetWidth
					}
					if(p.lim.top > val.y){
						val.y = p.lim.top;
					}
					if(p.lim.top + p.lim.height + p.lim.borderY/2 - el.dragEl.offsetHeight < val.y){
						val.y = p.lim.top + p.lim.height + p.lim.borderY/2 - el.dragEl.offsetHeight;
					}
				}
				if(axis){
					return val[axis];
				}
				return val;
			},
			inRange: function(val, p, x){
				if(!p || !p.scope){
					return true;
				}
				if(x){
					if(/x/.test(p.leaveScope)){
						return true;
					}
					if(el.scope != el.dragEl.parentNode){
						return(p.lim.left <= val.x && p.lim.left + p.lim.width - p.lim.borderX >= val.x + el.dragEl.offsetWidth);
					}else{
						return(0 <= val.x && p.lim.width - p.lim.borderX >= val.x + el.dragEl.offsetWidth);
					}
				}else{
					if(/y/.test(p.leaveScope)){
						return true;
					}
					if(el.scope != el.dragEl.parentNode){
						return(p.lim.top <= val.y && p.lim.top + p.lim.height - p.lim.borderY >= val.y + el.dragEl.offsetHeight);
					}else{
						return(0 <= val.y && p.lim.height + p.lim.borderY >= val.y + el.dragEl.offsetHeight);
					}	
				}
			},
			moveAt: function(e, p, ultimate){
				var
					pos = {
						x: e.pageX - el.runtime.shiftX - p.lim.left - p.lim.borderX/2,
						y: e.pageY - el.runtime.shiftY - p.lim.top - p.lim.borderY/2
					};
				if((ultimate || !p.scope) && !el.destScope){
					if(p.scope){
						pos = this.toRange(pos, p);
					}
					el.dragEl.style.left = pos.x + 'px';
					el.dragEl.style.top = pos.y + 'px';
					return;
				}
				if(!p.leftScope){
					this.checkOriginPosition(pos, p);
				}
				if(p.leaveScope){
					this.checkLeftScope(pos, p);
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
					if(p.lock){
						if($el.hasClass(p.lock)){
							return;
						}
					}
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
					p.defferedMove = false;
					el.style.opacity = 1;
					if(el.dragStarted){
						el.dragEl.parentNode.removeChild(el.dragEl);
						el.dragEl = null;
					}
					if(el.dragStarted){
						el.dragStarted = false;
						if(p && p.onDragEnd && typeof(p.onDragEnd) == 'function'){
							p.onDragEnd(el,p);
						}
					}
					p.inserted = null;
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
						if(p.defferedMove){
							$(el).FD_().moveAt(p.defferedMove, p, true);
						}
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
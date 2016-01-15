$(function(){
	$('.j_handler').click(function(){
		if($(this).hasClass('iconRight')){
			expand($(this));
		}else{
			collapse($(this));
		}
	});
	function expand(el){
		el
		.removeClass('iconRight').addClass('iconDown')
		.parents('.j_group').find('.j_subgroup').removeClass('s_hidden');
	};
	function collapse(el){
		el
		.removeClass('iconDown').addClass('iconRight')
		.parents('.j_group').find('.j_subgroup').addClass('s_hidden');
	}
  
  
	$('.j_trayItem').SbmFreeDrag({
		sourceCopy: true,
		lock: 'j_locked',
		leaveScope: 'x,y',// 'x' || 'y' || 'x,y'
		onDragStart: function(node){
			// console.log('draging has been started',node); 
			var
				rel = $(node).data('rel'),
				target = $('.j_handler[data-rel=' + rel + ']');
			expand(target);
			$(window).trigger('setDragScope',{
				scope: target.parents('.j_listItem').find('.j_subgroup')[0],
				insert: true,
				center: true,
				sortable: 'y',// 'x' || 'y' || 'x,y'
				dragMod: function(el){
					var
						$el = $(el);
					$el.css({
						height: '30px',
						width: '200px'
					});
				},
				srcMod: function(src, drag){
					$(src)
						.css({
							top: '0px',
							left: '0px',
							zIndex: 1,
							opacity: 0
						})
						.removeClass('trayItem s_noselect')
						.addClass('s_string menuItem submenuItem j_SubListItem')
						.html(drag.innerHTML)
						.SbmFreeDrag({
							lock: 'j_locked',
							scope: 'parent',
							leaveScope: 'x',// 'x' || 'y' || 'x,y'
							sortable: 'y',// 'x' || 'y' || 'x,y'
							onLeaveScope: function(el, p){
								var
									src = el,
									dragEl = el.dragEl;
								p.leaveScope = 'x,y';
								// console.log('element has left scope', el, p);
							},
							onReachScope: function(el, p){
								var
									src = el,
									dragEl = el.dragEl;
								p.leaveScope = 'x';
								// console.log('element has reached scope', el, p);
							},
							onDragEnd: function(el,p){
								if(p.leftScope){
									$(drag.origin).removeClass('j_locked');
									el.parentNode.removeChild(el);
								}
							}
						});
				},
				srcPasted: function(src){
					$(src).addClass('s_hidden');
				}
			});
			target.parents('.j_listItem').find('.j_subgroup').addClass('highlightedBlock');
		}, 
		onLeaveScope: function(el, p){
			var
				src = el,
				dragEl = el.dragEl,
				altSrc = p.inserted;
			if(altSrc){
				$(altSrc).addClass('s_hidden');
			}
			// console.log('element has left scope',el, p.leftScope);
		},
		onReachScope: function(el, p){
			var
				src = el,
				dragEl = el.dragEl,
				altSrc = p.inserted;
			// console.log('el has reached destination',el,p.leftScope)
			if(altSrc){
				$(altSrc).removeClass('s_hidden');
			}
		},
		onDragEnd: function(el,p){
			// console.log('draging has been ended',el,p.leftScope);
			var
				rel = $(el).data('rel'),
				target = $('.j_handler[data-rel=' + rel + ']');
			if(!p.leftScope){
				if(p.inserted){
					p.inserted.style.opacity = 1;
				}
				$(el).addClass('j_locked');
			}else{
				if(p.inserted){
					p.inserted.parentNode.removeChild(p.inserted);
				}
				collapse(target);
			}
			$(window).trigger('removeDragScope');
			target.parents('.j_listItem').find('.j_subgroup').removeClass('highlightedBlock');
		}
	}); 
	$('.j_listItem').SbmFreeDrag({	
		lock: 'j_locked',
		scope: 'parent',
		sortable: 'y',// 'x' || 'y' || 'x,y'
		overcrossing: 5,// 5px overcrossing before replacement happens
		sensitivity: 5,// 5px precision before dag will start, less then 5 px cursor delta ignores
		onDragStart: function(node){
			// console.log('draging has been started',node);
		},
		onDragEnd: function(node){//drop element
			// console.log('draging has been ended',node);
		}
	});
	$('.j_SubListItem').SbmFreeDrag({
		lock: 'j_locked',
		scope: 'parent',
		leaveScope: 'x',// 'x' || 'y' || 'x,y'
		sortable: 'y',// 'x' || 'y' || 'x,y'
		onLeaveScope: function(el, p){
			var
				src = el,
				dragEl = el.dragEl;
			p.leaveScope = 'x,y';
			// console.log('element has left scope',el, p);
		},
		onReachScope: function(el, p){
			var
				src = el,
				dragEl = el.dragEl;
			p.leaveScope = 'x';
			// console.log('element has reached scope',el);
		},
		onDragEnd: function(el,p){
			if(p.leftScope){
				el.parentNode.removeChild(el);
			}
		}
	});
});
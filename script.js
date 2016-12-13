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
	var
		topMenuHelper = {
			onLeaveScope: function(el, p){
				var
					src = el,
					dragEl = el.dragEl,
					altSrc = p.inserted || src;
				if(altSrc){
					// $(altSrc).addClass('s_hidden');
				};
				p.leaveScope = 'x,y';
			},
			onReachingScope: function(el, p){
				var
					src = el,
					dragEl = el.dragEl,
					altSrc = p.inserted || src;
				if(altSrc){
					// $(altSrc).removeClass('s_hidden');
				}
			},
			onDragEnd: function(el,p){
				p.leaveScope = 'y';
				if(p.leftScope){
					el.parentNode.removeChild(el);
				}
			}
		},
		leftMenuHelper = {
			onLeaveScope: function(el, p){
				var
					src = el,
					dragEl = el.dragEl,
					altSrc = p.inserted || src;
				if(altSrc){
					// $(altSrc).addClass('s_hidden');
				};
				p.leaveScope = 'x,y';
			},
			onReachingScope: function(el, p){
				var
					src = el,
					dragEl = el.dragEl,
					altSrc = p.inserted || src;
				if(altSrc){
					// $(altSrc).removeClass('s_hidden');
				}
			},
			onDragEnd: function(el,p){
				p.leaveScope = 'x';
				if(p.leftScope){
					el.parentNode.removeChild(el);
				}
			}
		},
		trayHelper = {
			onDragStart2: function(target){
				$(window).trigger('setDragScope',{
					scope: target[0],
					maxItems: 6,
					nsrc: document.createElement('div'),
					insert: true,
					center: true,
					sortable: 'x',
					dragMod: function(el){
						$(el)
						.addClass('topmenuItem')
						.removeClass('trayItem');
					},
					srcMod: function(src, drag){
						$(src)
							.css({
								margin: '10px',
								zIndex: 1,
								opacity: 0
							})
							.removeClass('trayItem s_noselect')
							.addClass('s_lwb topmenuItem j_topmenuItem')
							.html(drag.innerHTML)
							.SbmFreeDrag({
								lock: 'j_locked',
								scope: 'parent',
								leaveScope: 'y',
								sortable: 'x',
								onLeaveScope: topMenuHelper.onLeaveScope,
								onReachingScope: topMenuHelper.onReachingScope,
								onDragEnd: topMenuHelper.onDragEnd
							});
					},
					srcPasted: function(src){
						// $(src).addClass('s_hidden');
					}
				});
			},
			onDragStart: function(target){
				expand(target);
				$(window).trigger('setDragScope',{
					scope: target.parents('.j_listItem').find('.j_subgroup')[0],
					insert: true,
					center: true,
					sortable: 'y',
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
								leaveScope: 'x',
								sortable: 'y',
								onLeaveScope: leftMenuHelper.onLeaveScope,
								onReachingScope: leftMenuHelper.onReachingScope,
								onDragEnd: leftMenuHelper.onDragEnd
							});
					},
					srcPasted: function(src){
						// $(src).addClass('s_hidden');
					}
				});
				target.parents('.j_listItem').find('.j_subgroup').addClass('highlightedBlock');
			},
			onDragEnd: function(el,p){
				var
					target = $('.j_handler[data-rel=' + $(el).data('rel') + ']');
				if(!p.leftScope){
					if(p.inserted){
						p.inserted.style.opacity = 1;
					}
					// $(el).addClass('j_locked');
				}else{
					if(p.inserted){
						p.inserted.parentNode.removeChild(p.inserted);
					}
					// $(el).removeClass('j_locked');
					collapse(target);
				}
				$(window).trigger('removeDragScope');
				target.parents('.j_listItem').find('.j_subgroup').removeClass('highlightedBlock');
			}
		};
		
	$('.j_topmenuItem').SbmFreeDrag({
		lock: 'j_locked',
		scope: 'parent',
		leaveScope: 'y',
		sortable: 'x',
		onLeaveScope: topMenuHelper.onLeaveScope,
		onReachingScope: topMenuHelper.onReachingScope,
		onDragEnd: topMenuHelper.onDragEnd
	});
	$('.j_trayItem').SbmFreeDrag({
		sourceCopy: true,
		lock: 'j_locked',
		leaveScope: 'x,y',
		onDragStart: function(node){
			var
				lMenuHandler = $('.j_handler[data-rel=' + $(node).data('rel') + ']'),
				topMenu = $('.j_topmenu[data-rel=' + $(node).data('rel') + ']');
			if(lMenuHandler.length){
				trayHelper.onDragStart(lMenuHandler);
			}
			if(topMenu.length){
				trayHelper.onDragStart2(topMenu);
			}
		}, 
		onLeaveScope: leftMenuHelper.onLeaveScope,
		onReachingScope: leftMenuHelper.onReachingScope,
		onDragEnd: trayHelper.onDragEnd
	}); 
	$('.j_listItem').SbmFreeDrag({	
		lock: 'j_locked',
		scope: 'parent',
		sortable: 'y',
		overcrossing: 0,
		sensitivity: 5
	});
	$('.j_SubListItem').SbmFreeDrag({
		lock: 'j_locked',
		scope: 'parent',
		leaveScope: 'x',
		sortable: 'y',
		onLeaveScope: leftMenuHelper.onLeaveScope,
		onReachingScope: leftMenuHelper.onReachingScope,
		onDragEnd: leftMenuHelper.onDragEnd
	});
	$('#j_tray').SbmFreeDrag({
		trueDrag: true
	});
});
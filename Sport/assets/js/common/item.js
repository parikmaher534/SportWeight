$(function() {
    var currentItem, beforeScroll,

        itemsBlock = $('.items'),
        itemView = $('.item-view'),

        itemName = itemView.find('.item-view__name h3'),
        itemImg = itemView.find('.item-view__image img'),
        itemDesc = itemView.find('.item-view__description'),
        itemManuf = itemView.find('.item-view__manufacturer span'),
        itemPrice = itemView.find('.item-view__price span');


    /* API BEGIN*/
        $(document).on('itemview.hide', hide);
    /* API END */



    itemsBlock.on('click', function(e) {
        var id,
            el = $(e.target),
            item = el.closest('.item');

        beforeScroll = window.scrollY;

        // Игнорим событие при вводе чиса товаров
        if (el.closest('.item__buy').length) return false;

        // Добавляем товар в корзину
        if (el.closest('.item__cart').length) {
            $(document).trigger('card.add', {
                amount: +item.find('.item__buy-input').val(),
                id: item.data('id')
            });

            return false;
        };


        if (item) {
            id = item.data('id');

            if (id) {
                $.ajax({
                    url: '/items',
                    type: 'GET',
                    data: {
                        id: id
                    },
                    success: function(data) {
                        currentItem = data[0];

                        clearView();

                        itemView.data('item-view-id', data[0].id);
                        itemImg.attr('src', data[0].photoFull);
                        itemDesc.html(data[0].description);
                        itemName.html(data[0].name);
                        itemManuf.html(data[0].manufacturer);
                        itemPrice.html(data[0].price);

                        itemView.addClass('item-view__show');
                        $('.items').hide();

                        $('body').scrollTop(0);
                    },
                    error: function() {
                        $.notify('Не возможно получить список товаров.', 'error');
                    }
                });
            }
        };
    });

    $('.item-view__close').on('click', hide);

    $(document).on('click', '.item-view__cart', function(e) {
        $(document).trigger('card.add', {
            amount: +itemView.find('.item-view__buy-input').val(),
            id: itemView.data('item-view-id')
        });
    });

    function hide() {
        $('.items').show();
        itemView.removeClass('item-view__show');

        $('body').scrollTop(beforeScroll);
    };

    function clearView() {
        itemImg.attr('src', '/images/loaders/item.GIF');
        itemDesc.html('');
        itemName.html('');
        itemManuf.html('');
        itemPrice.html('');
    };
});

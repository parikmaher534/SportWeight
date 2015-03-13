$(function() {
    var beforeScroll,

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
            item = $(e.target).closest('.item');

        beforeScroll = window.scrollY;

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
                        clearView();

                        itemImg.attr('src', data[0].photoFull);
                        itemDesc.html(data[0].description);
                        itemName.html(data[0].name);
                        itemManuf.html(data[0].manufacturer);
                        itemPrice.html(data[0].price);

                        itemView.show();
                        $('.items').hide();

                        $('body').scrollTop(0);
                    },
                    error: function() {
                        alert('Не возможно получить список товаров.');
                    }
                });
            }
        };
    });

    $('.item-view__close').on('click', hide);

    function hide() {
        $('.items').show();
        itemView.hide();

        $('body').scrollTop(beforeScroll);
    };

    function clearView() {
        itemImg.attr('src', '');
        itemDesc.html('');
        itemName.html('');
        itemManuf.html('');
        itemPrice.html('');
    };
});


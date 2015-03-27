$(function() {
    var CardItemTmplSrc = $('#buy-cart-item-tmpl').html(),
        CardItemTmpl = Handlebars.compile(CardItemTmplSrc),

        buyItemsWrapper = $('.buy-form__items-list'),
        clientTel = $('#clientTel'),
        clientEmail = $('#clientEmail');


    $('.info-block__buy').on('click', createCartItems);

    $('.buy-form-close').on('click', closeBuyForm);

    $('.buy-form-send').on('click', buy);


    // Если обновилось состояние общей стоимости, обновляем DOM.
    $(document).on('card.update', function(e, data) {
        var itemDOM;

        if (data.totalSum) {
            $('.buy-form__total-cost span').html(data.totalSum);
        };

        if (data.items) {
            data.items.forEach(function(el) {
                itemDOM = $('[data-buycartitem-id="' + el.item.id + '"]');

                if (itemDOM.length) {
                    itemDOM.find('.buy-cart-item__price span').html(el.totalPrice);
                };
            });
        }
    });


    function closeBuyForm(e) {
        $('body').removeClass('show-buy-form');
    };

    function createCartItems(e) {
        buyItemsWrapper.empty();
        generateCartItems();

        $('body').addClass('show-buy-form');
    };

    function generateCartItems() {
        var cartData = getCartFromLS();

        cartData.items.forEach(function(el) {
            el.item.amount = el.amount;
            el.item.price *= el.amount;
            buyItemsWrapper.append(CardItemTmpl(el.item));
        });

        onItemRemove();
        onItemAmountChange();

        $('.buy-form__total-cost span').html(cartData.price);
    };

    function onItemRemove() {
        $('.buy-cart-item__close').on('click', function(e) {
            var el = $(this).closest('.buy-cart-item'),
                id = el.data('buycartitem-id');

            $(document).trigger('card.delete', {
                id: id,
                callback: function() {
                    $('[data-buycartitem-id="' + id + '"]').remove();
                    el.remove();
                }
            });
        });
    };

    function onItemAmountChange() {
        var id;

        $('.buy-cart-item-input').on('input', function(e) {
            id = $(this).closest('.buy-cart-item').data('buycartitem-id');

            $(document).trigger('card.update', {
                type: 'item',
                id: id,
                model: {
                    amount: +$(this).val()
                }
            });
        });
    };

    function getCartFromLS() {
        try {
            return JSON.parse(localStorage.getItem('cart'));
        } catch(e) {
            $.notify('Ошибка в данных о товаре.', 'error');
            console.log(e);
        };

        return false;
    };

    function buy(e) {
        if (validationError()) {
            $.notify('Проверьте правильность заполнения полей', 'error');
        } else {
            $.ajax({
                url: '/buy',
                type: 'POST',
                data: {
                    tel: clientTel.val(),
                    email: clientEmail.val(),
                    data: prepareCartData()
                },
                success: function(data) {
                    if (data.status == 200) {
                        $.notify('Описание заказа выслано вам на почту. Скоро мы свяжемся с вами.', 'ok');
                    } else {
                        $.notify(data.error, 'error');
                    }
                },
                error: function(error) {
                    $.notify(error, 'error');
                }
            });
        }
    };

    function prepareCartData() {
        var data = getCartFromLS();

        data.items = data.items.map(function(el) {
            return {
                id: el.item.id,
                name: el.item.name,
                price: el.item.price
            };
        })

        return JSON.stringify(data);
    };

    function validationError() {
        var isError = false,
            telVal = clientTel.val(),
            emailVal = clientEmail.val();

        if (!telVal || !emailVal) {
            isError = true;
        };

        if (!/^\d+$/.test(telVal)) {
            isError = true;
        };

        if (!/\S+@\S+\.\S+/.test(emailVal)) {
            isError = true;
        };

        return isError;
    };
});

$(function() {
    var total = 0,

        CardItemTmplSrc = $('#cart-item-tmpl').html(),
        CardItemTmpl = Handlebars.compile(CardItemTmplSrc),

        cartItemsBlock = $('.info-block__sails-items'),
        cartTotalPriceBlock = $('.info-block__sails-total span');



    /* API корзины */
    $(document).on('card.add', addToCart);
    $(document).on('card.draw', drawCartData);

    // Удаляем из корзины
    $(document).on('click', '.cart-item__close', removeFromCard);


    //TODO: убрать аякс-хуякс и хранить данные на клиенте.
    function addToCart(e, data) {
        var id;

        if (data.block && data.block.length) {
            id = data.block.data('id');

            // Берём данные о добавляемом в корзину товаре
            $.ajax({
                url: '/items',
                type: 'GET',
                data: { id: id },
                success: function(item) {
                    onGetItemData(item, data);
                },
                error: onGetItemDataError
            });
        }
    };

    function onGetItemData(data, special) {
        var cartData,
            currentItem,
            item = data[0],
            price = item.price * special.amount;


        // Добавляем первый товар в хранилище и в DOM
        if (!localStorage.getItem('cart')) {
            cartData = {
                price: price,
                items: [{
                    item: item,
                    amount: special.amount,
                    totalPrice: price
                }]
            };

            localStorage.setItem('cart', JSON.stringify(cartData));

            cartItemsBlock.append(CardItemTmpl({
                id: item.id,
                name: item.name,
                price: price,
                amount: special.amount
            }));

        // Если товары уже есть, то вытаскиваем данные о корзине из хранилища
        } else {

            cartData = getCartFromLS();

            // Ищем есть ли в корзине такой же товар
            cartData.items.forEach(function(cartItem) {
                if (cartItem.item.id == item.id) {
                    currentItem = cartItem;
                };
            });

            // Если такого товара нет, то попросту пушим его в массив
            if (!currentItem) {
                cartData.items.push({
                    item: item,
                    amount: special.amount,
                    totalPrice: price
                });

                cartItemsBlock.append(CardItemTmpl({
                    id: item.id,
                    name: item.name,
                    price: price,
                    amount: special.amount
                }));

            // Если товар уже есть просто пересчитываем его поля
            } else {
                currentItem.amount += special.amount;
                currentItem.totalPrice = currentItem.amount * item.price;

                updateCartItem($('[data-cartitem-id="' + item.id + '"]'), currentItem);
            }

            // Обновляем общую цену
            cartData.price += price;

            // Перезаписываем данные о корзине в хранилище
            localStorage.setItem('cart', JSON.stringify(cartData));
        };

        // Обновляем общую стоимость
        cartTotalPriceBlock.text(cartData.price);

        $.notify('Товар был добавлен в корзину', 'success');
    };


    function updateCartItem(dom, data) {
        dom.find('.cart-item__amount span').text(data.amount);
        dom.find('.cart-item__price span').text(data.totalPrice);
    };

    function onGetItemDataError(error) {
        $.notify('Не получилось добавить товар в корзину. Свяжитесь с нами по телефону.', 'error');
    };


    function drawCartData() {
        var cartData;

        cartData = getCartFromLS();

        if (cartData) {
            cartData.items.forEach(function(cartItem) {
                cartItemsBlock.append(CardItemTmpl({
                    id: cartItem.item.id,
                    name: cartItem.item.name,
                    price: cartItem.totalPrice,
                    amount: cartItem.amount
                }));
            });

            cartTotalPriceBlock.text(cartData.price);
        };
    };

    function removeFromCard(e) {
        var cartData, currentItem,
            el = $(e.target),
            item = el.closest('.cart-item'),
            itemId = item.data('cartitem-id');

        cartData = getCartFromLS();

        // Ищем товар в корзине удаляем его из хранилища и из DOM
        cartData.items.forEach(function(cartItem, i) {
            if (cartItem.item.id == itemId) {

                cartData.items.splice(i, 1);
                item.remove();

                cartData.price -= cartItem.totalPrice;
            };
        });

        cartTotalPriceBlock.text(cartData.price);

        // Перезаписываем данные о корзине в хранилище
        localStorage.setItem('cart', JSON.stringify(cartData));
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

    drawCartData();
});
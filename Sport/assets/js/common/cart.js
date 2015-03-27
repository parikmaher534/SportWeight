$(function() {
    var total = 0,

        CardItemTmplSrc = $('#cart-item-tmpl').html(),
        CardItemTmpl = Handlebars.compile(CardItemTmplSrc),

        cartItemsBlock = $('.info-block__sails-items'),
        cartTotalPriceBlock = $('.info-block__sails-total span');



    /* API корзины */
    $(document).on('card.add', addToCart);
    $(document).on('card.delete', removeFromCard);
    $(document).on('card.draw', drawCartData);
    $(document).on('card.update', updateCartData);

    // Удаляем из корзины
    $(document).on('click', '.cart-item__close', deleteItem);


    //TODO: убрать аякс-хуякс и хранить данные на клиенте.
    function addToCart(e, data) {
        var id;

        if (data.id) {

            // Берём данные о добавляемом в корзину товаре
            $.ajax({
                url: '/items',
                type: 'GET',
                data: { id: data.id },
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

    function deleteItem(e) {
        var el = $(e.target),
            item = el.closest('.cart-item'),
            itemId = item.data('cartitem-id'),
            isRemoved = removeFromCard(null, {id: itemId});

        if (isRemoved) item.remove();
    };

    function removeFromCard(e, data) {
        var cartData,
            isRemoved = false;

        cartData = getCartFromLS();

        // Ищем товар в корзине удаляем его из хранилища и из DOM
        cartData.items.forEach(function(cartItem, i) {
            if (cartItem.item.id == data.id) {

                cartData.items.splice(i, 1);

                cartData.price -= cartItem.totalPrice;

                isRemoved = true;
            };
        });

        cartTotalPriceBlock.text(cartData.price);

        // Перезаписываем данные о корзине в хранилище
        localStorage.setItem('cart', JSON.stringify(cartData));

        $(document).trigger('card.update', {
            totalSum: cartData.price
        });

        data.callback && data.callback(isRemoved);

        return isRemoved;
    };

    function updateCartData(e, data) {
        var cartData, cartItem, prevAmount, diff;

        if (data.type == 'item') {
            cartData = getCartFromLS();

            cartData.items.forEach(function(el, i) {
                if (el.item.id == data.id) {
                    cartItem = el;
                };
            });

            prevAmount = cartItem.amount;
            cartItem.amount = data.model.amount;

            diff = (cartItem.amount - prevAmount) * cartItem.item.price;

            cartItem.totalPrice += diff;
            cartData.price += diff;

            // Перезаписываем данные о корзине в хранилище
            localStorage.setItem('cart', JSON.stringify(cartData));

            $(document).trigger('card.update', {
                totalSum: cartData.price,
                items: cartData.items
            });
        };
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

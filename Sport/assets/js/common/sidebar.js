$(function() {
    var optimalHg,
        lisHg = 0,
        sidebar = $('.sidebar'),
        ul = sidebar.find('ul'),
        posY = sidebar.position().top,
        moreBtn = sidebar.find('.sidebar__more'),
        moreBtnHg = moreBtn.outerHeight(true);


    // Магия для красивого показа категорий
    if (sidebar.outerHeight(true) > $(window).outerHeight() - posY) {
        optimalHg = $(window).outerHeight() - posY - (moreBtnHg * 3);

        ul.find('li').each(function() {
            if (lisHg <= optimalHg) lisHg += $(this).outerHeight();
        });

        ul.css('height', lisHg);

        moreBtn.show();
    };

    /**
     TODO: на ресайз тоже делать магию с сайдбаром
     $(window).on('resize', function() {})
    */

    // Показываем все категории по клику
    moreBtn.on('click', function() {
        sidebar.addClass('sidebar__scrolled');
        sidebar.css('height', $(window).outerHeight() - posY);

        ul.css('height', 'auto');
        moreBtn.hide();
    });

    // Подгружаем данные по нужной категории
    ul.on('click', function(e) {
        var li = $(e.target).closest('li');

        $(document).trigger('itemview.hide');

        if (li.length) {
            $.ajax({
                url: '/items',
                type: 'GET',
                data: {
                    type: li.data('type')
                },
                success: function(data) {
                    $('body').scrollTop(0);

                    drawItems(data);
                },
                error: function() {
                    $.notify('Не возможно получить список товаров.', 'error');
                }
            });
        }
    });

    // Рисуем пришедшие товары
    function drawItems(data) {
        var ItemTmplSrc = $('#item-tmpl').html(),
            ItemTmpl = Handlebars.compile(ItemTmplSrc),
            html = '<div class="item__row">';

        data.forEach(function(item, i) {
            if (i != 0 && i % 2 == 0) {
                html += '</div>';
                html += '<div class="item__row">';
            }

            html += ItemTmpl(item);

            if (i == data.length - 1) {
                html += '&nbsp;';
            }
        });
        html += '</div>';

        $('.items').html(html);
    };
});

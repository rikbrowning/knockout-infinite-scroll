ko.bindingHandlers["infiniteScroll"] = {
    'numberOfItemsInRow': -1,

    'itemHeight': -1,
    'makeValueAccessor': function (valueAccessor, start, end) {
        return function () {
            var modelValue = valueAccessor(), unwrappedValue = ko.utils.peekObservable(modelValue);
            ko.utils.unwrapObservable(modelValue);
            var data = ko.utils.unwrapObservable(unwrappedValue['data']).slice(start, end);

            return {
                'name': unwrappedValue['name'],
                'foreach': data,
                'as': unwrappedValue['as'],
                'includeDestroyed': unwrappedValue['includeDestroyed'],
                'afterAdd': unwrappedValue['afterAdd'],
                'beforeRemove': unwrappedValue['beforeRemove'],
                'afterRender': unwrappedValue['afterRender'],
                'beforeMove': unwrappedValue['beforeMove'],
                'afterMove': unwrappedValue['afterMove'],
                'templateEngine': ko.nativeTemplateEngine.instance
            };
        }
    },
    'displayView': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var me = ko.bindingHandlers['infiniteScroll'];
        var $element = $(element);
        var $window = $(window);
        var scrollTop = $window.scrollTop();
        var numberOfRowsHidden = Math.floor(scrollTop / me.itemHeight);
        var currentHeight = $element.height();
        $element.css({ 'padding-top': (numberOfRowsHidden * me.itemHeight) + 'px' })
            .height(currentHeight - (numberOfRowsHidden * me.itemHeight));
        var rowsToDisplay = Math.ceil($window.height() / me.itemHeight) + 2;
        var start = numberOfRowsHidden * me.numberOfItemsInRow;
        var end = start + (rowsToDisplay * me.numberOfItemsInRow);
        ko.bindingHandlers['template']['update'](element, me.makeValueAccessor(valueAccessor, start, end), allBindings, viewModel, bindingContext);
    },
    'calculateLayout': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var me = ko.bindingHandlers['infiniteScroll'];
        var options = ko.utils.unwrapObservable(valueAccessor());
        var $element = $(element);
        var data = ko.utils.unwrapObservable(options.data);

        $element.empty();
        ko.bindingHandlers['template']['update'](element, me.makeValueAccessor(valueAccessor, 0, 1), allBindings, viewModel, bindingContext);
        var item = $element.children().eq(0);
        me.itemHeight = item.outerHeight(true);
        var itemWidth = item.outerWidth(true);
        var screenWidth = $element.width();

        $element.empty();
        me.numberOfItemsInRow = Math.floor(screenWidth / itemWidth);
        var numberOfRows = Math.ceil(data.length / me.numberOfItemsInRow);
        $element.height(me.itemHeight * numberOfRows);
    },
    'init': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var me = ko.bindingHandlers['infiniteScroll'];
        //set up bindings
        var scrollTimeout = -1;
        $(window).scroll(function () {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function () {
                me.displayView(element, valueAccessor, allBindings, viewModel, bindingContext);
            }, 400);
        });

        var resizeTimeout = -1;
        $(window).resize(function () {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function () {
                me.calculateLayout(element, valueAccessor, allBindings, viewModel, bindingContext);
                me.displayView(element, valueAccessor, allBindings, viewModel, bindingContext);
            }, 400);
        });


        return ko.bindingHandlers['template']['init'](element, me.makeValueAccessor(valueAccessor, 0, 0));


    },
    'update': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var me = ko.bindingHandlers['infiniteScroll'];
        var options = ko.utils.unwrapObservable(valueAccessor());
        var data = ko.utils.unwrapObservable(options.data);
        if (data.length > 0 && me.numberOfItemsInRow === -1) {
            me.calculateLayout(element, valueAccessor, allBindings, viewModel, bindingContext);

        }
        me.displayView(element, valueAccessor, allBindings, viewModel, bindingContext);
    }
};
ko.expressionRewriting.bindingRewriteValidators['infiniteScroll'] = false; // Can't rewrite control flow bindings

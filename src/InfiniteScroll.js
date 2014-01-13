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
                'afterMove': unwrappedValue['afterMove']
            };
        }
    },
    'displayView': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var me = ko.bindingHandlers['infiniteScroll'];
        var $element = $(element);
        var $window = $(window);
        var scrollTop = $window.scrollTop();
        var numberOfRowsHidden = Math.floor(scrollTop / me.itemHeight);
        
        $element.css({ 'padding-top': (numberOfRowsHidden * me.itemHeight) + 'px' });
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

        //if there is children they should be ok size wise so we can just go ahead.
        if ($element.children().length === 0)
            ko.bindingHandlers['template']['update'](element, me.makeValueAccessor(valueAccessor, 0, 1), allBindings, viewModel, bindingContext);
        var item = $element.children().eq(0);
        me.itemHeight = item.outerHeight(true);
        var itemWidth = item.outerWidth(true);
        var screenWidth = $element.width();

        me.numberOfItemsInRow = Math.floor(screenWidth / itemWidth);
        var numberOfRows = Math.ceil(data.length / me.numberOfItemsInRow);
        //jquery keeps adding in the padding to the height, we dont want that
        var padding = $element.css('padding-top');
        $element.css({ 'padding-top': '0px', 'box-sizing': 'border-box' })
            .height(me.itemHeight * numberOfRows).css({ 'padding-top': padding });
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
            }, 250);
        });


        return ko.bindingHandlers['template']['init'](element, me.makeValueAccessor(valueAccessor, 0, 0));


    },
    'update': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var me = ko.bindingHandlers['infiniteScroll'];
        var options = ko.utils.unwrapObservable(valueAccessor());
        var data = ko.utils.unwrapObservable(options.data);
        if (data.length > 0) {
            me.calculateLayout(element, valueAccessor, allBindings, viewModel, bindingContext);
            me.displayView(element, valueAccessor, allBindings, viewModel, bindingContext);
        }
    }
};
ko.expressionRewriting.bindingRewriteValidators['infiniteScroll'] = false; // Can't rewrite control flow bindings


var book = _require('services/book');
var file = _require('services/file');
var tag = _require('services/tag');
var relationtag = _require('services/relationtag');

module.exports = {
    route: '/collects.html',
    filter: ['joke'],
    get: eval(windAsync(fGetCollects))
};

var fNewCollects = eval(windAsync(fGetNewCollects));

function fGetCollects(req, res, next) {
    var that = this;

    // 最新的文章
    if (that.query.tag === 'new') {
        return $await(fNewCollects.apply(that, arguments));
    }

    var oUser = that.user;
    var nCurPage = that.query.page;
    var oRecommend = $await(tag.recommend());
    var oData = $await(relationtag.pageObj(oRecommend, {
        objType: book.type,
        '#{isEnd}': false
    }, 'updatedAt desc', nCurPage));

    var aCovers = $await(file.findCover(oData.data));
    that.render('site/index/books.html', {
        items: oData.data,
        covers: aCovers,
        data: oData,
        type: 'collect',
        listType: 'recommend'
    });
}

function fGetNewCollects(req, res, next) {
    var that = this;
    var nCurPage = that.query.page;

    var oFilter = book.filter();
    oFilter.order('createdAt desc');
    oFilter.cond('isEnd', false);
    oFilter.cond('isPublish', true);
    oFilter.page(nCurPage);
    var oData = $await(book.page(oFilter));
    var aItems = oData.data;
    var aCovers = $await(file.findCover(aItems));
    that.render('site/index/books.html', {
        items: aItems,
        covers: aCovers,
        data: oData,
        type: 'collect',
        listType: 'new'
    });
}
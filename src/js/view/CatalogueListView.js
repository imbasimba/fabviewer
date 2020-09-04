function CatalogueListView(){
 
    var html;
 
    function init(){
        html = $("<div ><ul id='catalogueList'></ul></div>");
        html.css("height","150px");
        html.css("overflow", "scroll");
        
    }
 
    var _public = {
        getHtml: function(){
            return html;
        },
        addCatalogue: function(catalogueView){
            html.find("#catalogueList").append(catalogueView.getHtml());
        }
    }
 
    init();
    return _public;
}
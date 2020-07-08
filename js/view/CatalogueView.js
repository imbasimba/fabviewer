function CatalogueView(in_name){
 
    var html;
 
    function init(){
    	html = $("<li><input type='checkbox'/><label></label><br></li>");
    }
 
    var _public = {

    	getHtml: function(){
            return html;
        },
        setModel: function(model){
        	
        	html.find("input").attr('id', model.getName());
        	
            html.find("label").attr('for', model.getName());
            html.find("label").html(model.getName());

        },
        addCheckedHandler: function(handler){
            html.find("input").click(handler);
        }
    }
 
    init();
    return _public;
}
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
        	
        	html.find("input").attr('id', model.name);
        	
            html.find("label").attr('for', model.name);
            html.find("label").html(model.name);

        },
        addCheckedHandler: function(handler){
            html.find("input").click(handler);
        }
    }
 
    init();
    return _public;
}
function CataloguePresenter(_view){
 
    var view;
    var model;
 
    function init(_view){
        view = _view;
        view.addCheckedHandler(function(){
            // TODO call ModelRepo to retrieve metadata with the current FoV
        	console.log("// TODO call ModelRepo to retrieve metadata with the current FoV");
        });
    }
 
    var _public = {
        getView: function(){
            return view;
        },
        setModel: function(_model){	// of type 
            model = _model;
            view.setModel(model);
        }
    }
 
    init(_view);
    return _public;
}
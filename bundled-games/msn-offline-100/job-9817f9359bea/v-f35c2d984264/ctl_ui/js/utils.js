function htmlMarkupToNode(html){
    let template = document.createElement("template");        
    template.innerHTML = html ;
    let node = template.content.cloneNode(true) ;
    return node ;   
}

function stripHTML(myString){
    return myString.replace(/<[^>]*>?/gm, '');
};
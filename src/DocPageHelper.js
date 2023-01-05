function GetPageYCoordinateRelativeDocument(id, pageIndex){
    let container = document.getElementById(id); 
    if(!container){
        return 0;
    }
    let doc = container.querySelector(`.${id}_document`);
    if(!doc){
        return 0;
    }
    let page = doc.querySelector(`.${id}_page_${pageIndex}`);
    if(!page){
        return 0;
    }

    let docRect = doc.getBoundingClientRect();
    let pageRect= page.getBoundingClientRect();

    return (pageRect.top - docRect.top);
}   

function GetPageHeight(id, pageIndex){
    let container = document.getElementById(id);
    if(!container){
        return 0;
    }
    let page = container.querySelector(`.${id}_page_${pageIndex}`);
    if(!page){
        return 0;
    }
    return page.getBoundingClientRect().height;
}

export {GetPageYCoordinateRelativeDocument, GetPageHeight}
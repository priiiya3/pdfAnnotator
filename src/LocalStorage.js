function SaveLocalStorage(key, value){
    if(typeof value != "string"){
        value = JSON.stringify(value);
    }
    localStorage.setItem(key, value);
}

function GetLocalStorage(key){
    let value = localStorage.getItem(key)
    if(!value){
        return null;
    }
    return JSON.parse(value);
}

function KeyExists(key){
    let value = localStorage.getItem(key)
    if(!value){
        return false;
    }
    return true;
}


export {SaveLocalStorage, GetLocalStorage, KeyExists}
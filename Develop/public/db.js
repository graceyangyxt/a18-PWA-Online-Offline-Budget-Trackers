import { application, json, response } from "express";

let db ;
const request = indexedDB.open("Budget",1);

request.onupgradeneeded = function (event){
    const db = event.target.result;
    db.createObjectStore("pending",{autoIncrement:true});
    
}

request.onsuccess = function(event){
    db = event.target.result;
    if(navigator.onLine){
        runDataBase();
    }
}
request.onerror = function(event){
    console.log("error here: ", event.target.errorCode)
}

function runDataBase(){
    const transaction = db.transaction(["pending"],"rewrite");
    const store = transaction.objectStore("pending");
    const getAll =  store.getAll();
    getAll.onsuccess = function(){
        if(getAll.result.length > 0){
            fetch("/api/transaction/bulk",{
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"

                }
            })
            .then(response=>response.json())
            .then(()=>{
                const transaction = db.transaction(["pending"],"rewrite");
                const store = transaction.objectStore("pending");
                store.clear();
            })
        }
    } 
}

function saveRecord(transfer){
    const transaction = db.transaction(["pending"],"rewrite");
    const store = transaction.objectStore("pending");
    store.add(transfer);
}

window.addEventListener("online",runDataBase);
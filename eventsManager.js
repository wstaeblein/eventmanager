"use strict";

class eventsManager {
    constructor() {
        this.fnMap = [];        // Event map array
    }

    // Events can be in the form of click.myplugin or just click
    on(elems, event, func, capture) {
        let arr = this.#gatherElements(elems) || [];

        arr.forEach((e) => {
            if (e) { this.#add(e, event, func, capture); }
        });

        console.log('-------------------------------------------')
        console.log(this.fnMap)
    }

    // Transforms whatever was entered as elems in an array of one or more DOM elements.
    // Expects:
    // - string --> Can be an ID in the format #identifier or anything querySelectorAll would accept
    // - Array  --> Of strings such as above or DOM elements. Can mix.
    #gatherElements(elems) { 
        let arr = [];
        let _elems = Object.prototype.toString.call(elems) == '[object NodeList]' ? Array.from(elems) : elems;

        if (Array.isArray(_elems)) {
            _elems.forEach((e) => {
                if (typeof e == 'string') {
                    let nodes = this.#stringEle(_elems);
                    if (nodes && nodes.length) { arr.push(...nodes) }
                } else {
                    arr.push(e);
                }
            });
        } else { 
            if (typeof _elems == 'string') {
                let nodes = this.#stringEle(_elems);
                if (nodes && nodes.length) { nodes.forEach((e) => arr.push(e)); }
            } else {
                arr.push(_elems);
            }
        }
        return arr;  
    }


    // Use cases:
    // ele = DOM element & event = 'click' or 'click.mynamespace': Remove event from element
    // ele ommited & event = 'click' or 'click.mynamespace': Remove event from all elements
    // ele = DOM Element & event ommited: Remove all events from this element
    // If event starts with a dot (eg. .mycomponent), remove all event handlers with a namespace like whatever is after the dot (like JQuery does)
    // When 1 arg is passed, it is assumed to be event and will remove all such events from all objects. 
    // To remove all events from one (or more) elements, pass the element(s) and event as null
    // No arguments and all events stored are removed
    off(elems, event) {
        if (!elems && !event) { 
            Object.keys(this.fnMap).forEach((item) => item.element.removeEventListener(item.event, item.func));
            this.fnMap = [];
            return;
        }
        if (arguments.length == 1) { event = elems; elems = null; }
        let isNS = event ? event[0] == '.' : false;
    
console.log(elems, event)

        if (!elems) {  
            // No element, remove all events passed in event from all elements
            this.#removeItems(event, isNS);
        } else {
            // Element is present, go for it's events only
            let eleArr = this.#gatherElements(elems);                                           // Transform elems in html elements       
            let targetEles = this.fnMap.filter((it) => {                                        // Filter the whole event map array
                let eleScheme = eleArr.find((e) => e == it.element);                            // Test it against the elements got from elems
                let evtScheme = isNS ? it.ns == event : it.event == event || event === null;    // and the event / namespace passed
                return eleScheme && evtScheme;
            });
            console.log(targetEles)
            this.#removeItems(event, isNS, targetEles);
        }
    }


    #removeItems(event, isNS, itemArray) {
        itemArray = itemArray || this.fnMap;
        let ind =  itemArray.length;

        while(ind--) {
            let item = itemArray[ind]; console.log(item)
            if (isNS ? item.ns == event : item.event == event || !event) { 
                item.element.removeEventListener(item.event, item.func);
                itemArray.splice(ind, 1);
            }                
        }
    }
    
    #add(ele, event, func, capture) {
        let evtArr = event.split('.');
        let ns =  evtArr.length == 2 ? '.' + evtArr[1] : '';
        let newitem = { element: ele, event: evtArr[0], func, ns };
        
        ele.addEventListener(newitem.event, newitem.func, !!capture);
        this.fnMap.push(newitem);
    }

    // Returns string element as an array of elements
    #stringEle(ele) { 
        if (ele[0] == '#') {
            let node = document.getElementById(ele.substring(1));
            console.log(node)
            console.log(node.cloneNode(true))
            console.log('***************************')
            return node ? [node.cloneNode(true)] : [];
        } else {
            console.log('fuck')
            return [...document.querySelectorAll(ele)];
        }
    }
}
  
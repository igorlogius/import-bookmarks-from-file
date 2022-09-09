/* global browser */

const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_\+.~#?&//=]*/gm;
const folders = document.getElementById('folders');
const status = document.getElementById('status');

let impbtn;

async function importData(bookmarkId, data){


      let count = 0;
      const str = data;

		let m;
		while ((m = regex.exec(str)) !== null ) {
			// This is necessary to avoid infinite loops with zero-width matches
			if (m.index === regex.lastIndex) {
				regex.lastIndex++;
			}

			// The result can be accessed through the `m`-variable.
			m.forEach((match, groupIndex) => {
				//console.log(`Found match, group ${groupIndex}: ${match}`);

				if(groupIndex === 0) { // group 0 is the full match

                    browser.bookmarks.create({
                        parentId: bookmarkId,
                        url: match
                    });
                    count++;

                }
			});
        }
        status.innerText = 'Done. Created ' + count + ' Bookmarks';
}

function recGetFolders(node, depth = 0){
    let out = new Map();
    if(typeof node.url !== 'string'){
        if(node.id !== 'root________'){
            out.set(node.id, { 'depth': depth, 'title': node.title });
        }
        if(node.children){
            for(let child of node.children){
                out = new Map([...out, ...recGetFolders(child, depth+1) ]);
            }
        }
    }
    return out;
}

async function initSelect() {
    const nodes = await browser.bookmarks.getTree();
    let out = new Map();
    let depth = 1;
    for(const node of nodes){
        out = new Map([...out, ...recGetFolders(node, depth) ]);
    }
    for(const [k,v] of out){
        //console.debug(k, v.title);
        folders.add(new Option("-".repeat(v.depth) + " " + v.title, k))
    }
}

async function onLoad() {

    await initSelect();
    impbtn = document.getElementById('impbtn');

    folders.addEventListener('input', function (/*evt*/) {
        if(folders.value !== ''){
            impbtn.disabled = false;
        }else{
            impbtn.disabled = true;
        }
    });

    // read data from file into current table
    impbtn.addEventListener('input', function (/*evt*/) {
        //console.log('impbtn');
        const file  = this.files[0];
        const reader = new FileReader();
            reader.onload = async function(/*e*/) {
            try {
                const data = reader.result;
                console.log('folders.value', folders.value);
                importData(folders.value, data);
            } catch (e) {
                console.error(e);
                status.innerText = 'Import failed!' + e;
            }
        };
        reader.readAsText(file);
    });
}

document.addEventListener('DOMContentLoaded', onLoad);


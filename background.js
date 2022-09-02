/* global browser */

const manifest = browser.runtime.getManifest();
const extname = manifest.name;

const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_\+.~#?&//=]*/gm;

//<input id="impbtn" type="file" value="" style="display:none" />

let impbtn = document.createElement('input');
impbtn.type = "file";
//impbtn.accept = "text/plain";

let impBMid = null;

browser.menus.create({
    title: extname,
    contexts: ["bookmark"],
    visible: true,
    onclick: async function(info /*, tab*/) {
        if(info.bookmarkId) {
            try {
                impBMid = info.bookmarkId;
                impbtn.click();
            }catch(e){
                console.error(e);
            }
        }
    }
});

async function importData(bookmarkId, data){

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

                }
			});
        }
}

// read data from file into current table
impbtn.addEventListener('input', function (/*evt*/) {
	var file  = this.files[0];
	var reader = new FileReader();
            reader.onload = async function(/*e*/) {
            try {
                const data = reader.result;
                importData(impBMid, data);
            } catch (e) {
                console.error(e);
            }
        };
        reader.readAsText(file);
});


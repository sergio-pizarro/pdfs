const bwipjs = require('bwip-js');
const fs = require('fs');
const pdfMakePrinter = require('pdfmake/src/printer');
const sql = require('mssql');

//server=serv-280;database=GALVARINO;uid=usr_galvarino;password=Araucana.02#
//sql.connect('mssql://usr_galvarino:Araucana.02#@serv-280/GALVARINO');
//const result = sql.query(``);
//console.dir(result);

const config = {
    user: 'usr_galvarino',
    password: 'Araucana.02#',
    server: 'serv-280',
    database: 'GALVARINO',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
}

var fonts = {
	Roboto: {
		normal: 'fonts/Roboto-Regular.ttf',
		bold: 'fonts/Roboto-Medium.ttf',
		italics: 'fonts/Roboto-Italic.ttf',
		bolditalics: 'fonts/Roboto-MediumItalic.ttf'
	}
};

function groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
         const key = keyGetter(item);
         const collection = map.get(key);
         if (!collection) {
             map.set(key, [item]);
         } else {
             collection.push(item);
         }
    });
    return map;
}

function distinct(array){  
    const result = [];
    const map = new Map();
    for (const item of array) {
        if(!map.has(item.CodOficina)){
            map.set(item.CodOficina, true);    // set any value to Map
            result.push({
                CodOficina: item.CodOficina,
                Nombre: item.Nombre
            });
        }
	}
	
	return result;
}

let printer = new pdfMakePrinter(fonts);


sql.connect(config).then(pool => {
    // Query
    
    return pool.request()
	.query(`SELECT *, 
			CodTipoCredito + FolioCredito +  RIGHT('000000000'+ISNULL(REPLACE(RutAfiliado, '-',''),''),9) CodigoBarra 
			FROM [dbo].[GENERA_DATA_TESTING_NACIONAL_ZONA]`)
}).then(result => {
    console.dir(result)
	//const oficinas = groupBy(result.recordset, offic => offic.CodOficina);
	const oficinas = distinct(result.recordset);
	const folios = result.recordset;
	//console.log({dist})	
		
	oficinas.forEach(oficina => {
		
		console.log(`Procesando Oficina #${oficina.CodOficina} - ${oficina.Nombre}`)
		let docDefinition = {
			content: []
		}

		function addPDF(folio){
			bwipjs.toBuffer({
					bcid:        'code128',       // Barcode type
					text:        folio,    // Text to encode
					scale:       3,               // 3x scaling factor
					height:      10,              // Bar height, in millimeters
					includetext: true,            // Show human-readable text
					textxalign:  'center',        // Always good to set this
			}, async (err, png) => {
				if (err) {
					console.log({ err })
				} else {
					
					docDefinition.content.push({ 
						alignment: 'justify',
						image: 'data:image/png;base64,' + png.toString('base64'),
						width: 200,
						margin: [150, 15],
					})
				}
			});
		}

		folios.filter(fol => fol.CodOficina === oficina.CodOficina).forEach(folio=>{
			addPDF(folio.CodigoBarra);
		});

		setTimeout(()=>{
			let pdfDoc = printer.createPdfKitDocument(docDefinition);
			pdfDoc.pipe(fs.createWriteStream(`pdfs/${oficina.Nombre}.pdf`));
			pdfDoc.end();
			console.log(`Fin .. Oficina #${oficina.CodOficina} - ${oficina.Nombre}`);
		}, 30000)
	});

}).catch(err => {
    // ... error checks
})

/////////////////////////////////////////////////


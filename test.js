const array = [
    { id: 3, name: 'Central Microscopy', fiscalYear: 2018 },
    { id: 5, name: 'Crystallography Facility', fiscalYear: 2018 },
    { id: 3, name: 'Central Microscopy', fiscalYear: 2017 },
    { id: 5, name: 'Crystallography Facility', fiscalYear: 2017 }
  ];
distinct(array)

function distinct(array){  
    const result = [];
    const map = new Map();
    for (const item of array) {
        if(!map.has(item.id)){
            map.set(item.id, true);    // set any value to Map
            result.push({
                id: item.id,
                name: item.name
            });
        }
    }
    console.log(result)
}
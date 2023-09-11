function getSeeds(){
    
    let seeds = []
    let i = 735;
    while( i <= 741){
        let url = `https://ambiente.gob.do/wp-admin/admin-ajax.php?juwpfisadmin=false&action=wpfd&task=files.display&view=files&id=${i}&rootcat=704&page=&orderCol=title&orderDir=asc&page_limit=100&type=reglamentos`
        seeds.push(url)
        i++
}
seeds.push('https://ambiente.gob.do/wp-admin/admin-ajax.php?juwpfisadmin=false&action=wpfd&task=files.display&view=files&id=707&rootcat=704&page=&orderCol=title&orderDir=asc&page_limit=100&type=reglamentos')
seeds.push('https://ambiente.gob.do/wp-admin/admin-ajax.php?juwpfisadmin=false&action=wpfd&task=files.display&view=files&id=699&rootcat=704&page=&orderCol=title&orderDir=asc&page_limit=100&type=reglamentos')
seeds.push('https://ambiente.gob.do/wp-admin/admin-ajax.php?juwpfisadmin=false&action=wpfd&task=files.display&view=files&id=705&rootcat=704&page=&orderCol=title&orderDir=asc&page_limit=100&type=reglamentos')
seeds.push('https://ambiente.gob.do/wp-admin/admin-ajax.php?juwpfisadmin=false&action=wpfd&task=files.display&view=files&id=706&rootcat=704&page=&orderCol=title&orderDir=asc&page_limit=100&type=reglamentos')
}
const jobs: {
    [name: string]: { title: string; description: string; requirements: string };
} = {
    waterfront: {
        title: 'Muncitor portuar',
        description:
            'Munca in port este destul de prafuita. \n Va trebui sa cari greutati si sa transporti containere mari cu marfa folosind echipamente speciale! \n Dupa atingerea unui nou nivel, plata pentru munca ta va creste. De asemenea, odata cu noul nivel, sarcinile tale se vor schimba.',
        requirements: 'Nivel 1 de joc'
    },
    building: {
        title: 'Constructor',
        description:
            'Orasul creste rapid si trebuie sa finalizam proiectele cat mai repede! \n Pe santier va trebui sa cari materiale grele si sa descarci camioane! \n Dupa atingerea unui nou nivel, plata pentru munca ta va creste. De asemenea, odata cu noul nivel, sarcinile tale se vor schimba.',
        requirements: 'Nivel 1 de joc'
    },
    postal: {
        title: 'Lucrator postal',
        description:
            'Este haos la posta! \n Cetatenii asteapta scrisorile si coletele lor. \n Va trebui sa livrezi scrisori si sa transporti colete mari! \n Dupa atingerea unui nou nivel, plata pentru munca ta va creste. De asemenea, odata cu noul nivel, sarcinile tale se vor schimba.',
        requirements: 'Nivel 2 de joc, Permis de conducere categoria B'
    },
    car_theft: {
        title: 'Hot de masini',
        description:
            'Tine minte un lucru - aceasta munca este ilegala! \n Odata ce alegi acest drum, nu mai este cale de intoarcere! Va trebui sa spargi masini folosind o unealta speciala si sa le duci la clienti. \n Odata cu atingerea unui nou nivel, dificultatea furtului va creste, iar plata va fi mai mare.',
        requirements: 'Nivel 3 de joc, Ustensile de spargere'
    },
    smuggling: {
        title: 'Contrabandist',
        description:
            'Dupa ce primesti marfa, mergi la locatia indicata. \n Coordonatele ti-au fost trimise pe GPS. \n Calatoreste cu grija, fara sa atragi atentia. \n Daca politia te vede, s-ar putea sa ajungi in inchisoare pentru mult timp.',
        requirements: 'Nivel 3 de joc'
    },
    culegatorlegume: {
        title: 'Culegator de Legume',
        description:
            'Orasul creste rapid si este mare nevoie de legume! \n Va trebui sa culegi legume si apoi sa le vinzi la Piata! \n Dupa atingerea unui nou nivel, plata pentru munca ta va creste. De asemenea, odata cu noul nivel, sarcinile tale se vor schimba.',
        requirements: 'Nivel 1 de joc'
    },
    culegatorfructe: {
        title: 'Culegator de Fructe',
        description:
                'Orasul creste rapid si este mare nevoie de fructe pentru vitamine! \n Va trebui sa culegi fructe si apoi sa le vinzi la Piata! \n Dupa atingerea unui nou nivel, plata pentru munca ta va creste. De asemenea, odata cu noul nivel, sarcinile tale se vor schimba.',
        requirements: 'Nivel 1 de joc'
    },
    ziare: {
        title: 'Livrator de Ziare',
        description:
                'Orasul este curios si persoanele vor sa stie ce se intampla! \n Va trebui sa livrezi ziare direct la usile cetatenilor orasului!',
        requirements: '5 Ore in oras'
    }
};


export default jobs;

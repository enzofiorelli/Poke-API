//Importando o Express e realizando sua requisição
const express = require("express"); // importação do pacote
const app = express(); 
const axios = require("axios")
// const maxPokemons = 10;

const pokeAPI = axios.create({
    baseURL: "https://pokeapi.co/api/v2/" //Função que guarda a API base
})

const porta = 3000 // Porta do servidor

app.listen(porta, () => console.log(`O Servidor está rodando na porta: ${porta}`))

app.get('/pokemon/:id', async (req, resp) => {

    // ERRO NO SERVIDOR, NÃO PEGA POKEMONS A PARTIR DO ID 10

    const id = req.params.id; // Obtendo o valor do parâmetro :id da URL

    try {
        const { data } = await pokeAPI.get(`pokemon/${id}`);

        const { data: evoChain } = await pokeAPI.get(`evolution-chain/${id}`);
        const { data: gens } = await pokeAPI.get(`generation/${id}`);

        // Objeto Pokemon
    
        const pokemon = {
            id: data.id,
            name: data.name,
            type: data.types.map((pokemonType) => {
                return { type_name: pokemonType.type.name };
            }),
            gen: gens.name,
            evo: evoChain.chain.evolves_to.map((pokemonEvo) => {
                return{ evolves_to: pokemonEvo.species.name}
            }),
            power: data.abilities.map((pokemonAbility) => {
                return { ability: pokemonAbility.ability.name }
            })
        }

        // console.log('evoChain:', evoChain);
        // console.log('Gens:', gens)
        
        // console.log(pokemon)
        return resp.json(pokemon);

    } catch (error) {
        console.error(`Erro: ${error}`);
        resp.status(500).json({ error: 'Erro interno do servidor' });
    }   
});

app.get(`/pokemon`, async function(req, resp){

    // Paginação: Recebe o número da página e por padrão apresenta a pag 1

    const { page = 1 } = req.query;
    console.log(`Page: ${page}`)

    // Limita os registros por página
    const limit = 50;

    var lastPage = 1;
    var offset = ((page*limit)-limit);

    const { data } = await pokeAPI.get(`pokemon?limit=${limit}&offset=${offset}`)
    // const { data: species } = await pokeAPI.get(`pokemon-species`)
    let pokemons = [];

    async function GetPokeBasicInfo(){

        try {

            for(item of data.results){

                const { data } = await pokeAPI.get(item.url)

                // console.log(data)

                let pokemon = {
                    id: data.id,
                    name: data.name,
                    type: data.types.map((pokemonType) => {
                        return pokemonType.type.name
                    }),
                    power: data.abilities.map((pokemonAbility) => {
                        return pokemonAbility.ability.name 
                    })
                } 

        pokemons.push(pokemon)

        }

        // return resp.json(pokemons)
            
        } catch (error) {
            console.error(error)
            resp.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async function GetGens(id){

        try {

            const { data:  species  } = await pokeAPI.get(`pokemon-species/${id}`)
            // console.log(gens)
            let generation = {
                gens: species.generation.name
            }

            return generation
            
        } catch (error) {
            console.error(error)
            resp.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async function GetEvolution(id){

        try {

                const { data: species } = await pokeAPI.get(`pokemon-species/${id}`);
                const evolution_chain = await pokeAPI.get(species.evolution_chain.url);    
                evoInfo = evolution_chain.data.chain;

                // console.log(`Chain: `,evoInfo)

                function extractNamesEvo(evolutionChain){
                    let arrayEvolutions = [];

                    evolutionChain.forEach(evo => {
                        arrayEvolutions.push(evo.species.name)

                        const nextEvo = extractNamesEvo(evo.evolves_to);
                        arrayEvolutions = arrayEvolutions.concat(nextEvo)

                    });
                    return arrayEvolutions;
                }

                let evolutions = extractNamesEvo([evoInfo])

                return evolutions;
            
        } catch (error) {
            console.error(error)
            resp.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

        await GetPokeBasicInfo()

        for(item of pokemons){
            pokeGen = await GetGens(item.id);
            pokeEvolution = await GetEvolution(item.id);
            item.gen = pokeGen
            item.evo = pokeEvolution  
        }

        return resp.json(pokemons) 

    // console.log(pokemons)

    // Conta a quantidade de pokemons
    // let counter = 0;

    // async function CountPoke(pokemons){

    //     for(item of pokemons){
    //         counter++
    //     }
    //     // console.log(counter)
    //     return counter;

    // }
    // // Ultima página de acordo com o counter
    // async function LastPage(counter){
        
    //     try {
    //         if(counter !== 0){
    //             lastPage = (counter/limit)
    //         }
    //     } catch (err) {
    //         console.err("Nenhum pokemon dentro do objeto")
    //     }
    //     // console.log(lastPage)
    //     return lastPage;

    // }

})

app.get('/cities', async function(req, resp){

    try {

        const { data } = await pokeAPI.get(`location`);

    const cities = {
        name: data.results.map((cities)=>{
            return cities.name
        })
    }

    return resp.json(cities)
        
    } catch {
        console.error(`Erro: ${error}`);
        resp.status(500).json({ error: 'Erro interno do servidor' }); 
    }

})
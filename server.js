//Importando o Express e realizando sua requisição
const express = require("express"); // importação do pacote
const app = express(); 
const axios = require("axios")
const maxPokemons = 10;

const pokeAPI = axios.create({
    baseURL: "https://pokeapi.co/api/v2/" //Função que guarda a API base
})

const porta = 3000 // Porta do servidor

app.listen(porta, () => console.log(`O Servidor está rodando na porta: ${porta}`))

app.get('/pokemon/:id', async (req, resp) => {

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
        
        console.log(pokemon)
        return resp.json(pokemon);

    } catch (error) {
        console.error(`Erro: ${error}`);
        resp.status(500).json({ error: 'Erro interno do servidor' });
    }   
});


app.get('/pokemon', async function(req, resp){

    // ?limit=${maxPokemons}

    try {

        const { data } = await pokeAPI.get(`pokemon?offset=0&limit=50`)

        const { data: evoChain } = await pokeAPI.get(`evolution-chain/`);
        const { data: gens } = await pokeAPI.get(`generation/`);
        
            for(item in data){
                const { data } = await pokeAPI.get(item.url)

                // const pokemon = {
                //         // id:,
                //         name: data.results.map((poke)=>{
                //             return{name: poke.name}
                //         }),
                //         type: url.type.map((pokemonType) => {
                //             return { type_name: pokemonType.type.name };
                //         }),
                //         // gen: gens.name,
                //         // evo: evoChain.chain.evolves_to.map((pokemonEvo) => {
                //         //     return{ evolves_to: pokemonEvo.species.name}
                //         // }),
                //         // power: data.abilities.map((pokemonAbility) => {
                //         //     return { ability: pokemonAbility.ability.name }
                //         // })
                    // }

            return resp.json(data.name)
            return resp.json(pokemon)
            
        }
    } catch (error) {
        console.error(error)
        resp.status(500).json({ error: 'Erro interno do servidor' });
    }

    
})

app.get('/cities', async function(req, resp){

    const { data } = await pokeAPI.get(`location`);

    const cities = {
        name: data.results.map((cities)=>{
            return{city: cities.name}
        })
    }
    return resp.json(cities)

})




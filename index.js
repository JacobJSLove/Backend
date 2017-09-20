'use strict';
const Joi = require('joi');
const Hapi = require('hapi');
const server = new Hapi.Server();
const Inert = require('inert');  
const Vision = require('vision');  
const HapiSwagger = require('hapi-swagger');
const pkg = require('./package.json');  
const ContactSchema = Joi.object({  
  contact: Joi.object({
    name: Joi.string().required().example('Jan').description(`Contact's name`),
    surname: Joi.string().required().example('Kowalski').description(`Contact's surname`)
  }).required().label('Contact')
}).required().label('ContactSchema');
const options = {  
  info: {
    title: pkg.description,
    version: pkg.version
  }
};
const contacts = [];  
const citys = [];  
server.connection({  
    host: 'localhost',
    port: 3000
});

server.register([  
  Inert,
  Vision,
  {register: HapiSwagger, options}
], err => {
  if (err) {
    throw err;
  }

  server.start((err) => {
    if (err) {
      throw err;
    }

    console.log(`Server running at ${server.info.uri}`);
  });
});
server.route({  
  method: 'GET',
  path: '/contacts',
  config: {
    tags: ['api'],
    description: 'Show contacts',
    notes: 'Returns list of  contacts'},
  	handler(request, reply) {
    directory: {
            path: 'public'
        }
    reply({
      contacts
    });
  }
});
server.route({  
  method: 'GET',
  path: '/citys',
  config: {
    tags: ['api'],
    description: 'Show citys',
    notes: 'Returns list of  citys'},
    handler(request, reply) {
    directory: {
            path: 'public'
        }
    reply({
      citys
    });
  }
});
server.route({
    method: 'GET',
    path: '/city/{id}',
 config: {
      handler: function(req, reply){
                    if(citys.length <= req.params.id){
                        return reply({message:"product does not exists", responseCode: 1}).code(404);
                    }
                                        reply({'citys':citys[req.params.id], 'responseCode':0});
                                  
 }
 }
});
server.route({  
  method: 'POST',
  path: '/citys',
  config: {
    tags: ['api'],
    description: 'Add city',
    validate: {
      payload: Joi.object({
        city: Joi.object({
          id: Joi.number().integer().required(),
          name: Joi.string().required(),
          zipcode: Joi.string().required(),
          limit: Joi.string().required()
        }).required()
      })
    }
  },
  handler(request, reply){
  const city = request.payload.city;
    const cityExists = citys.find(c => c.id === city.id && c.name === city.name);
  if (cityExists) {
    return reply('This city exists!').code(409);
  }
    citys.push(city);
    reply({city}).code(201);
  }
});
server.route({  
  method: 'POST',
  path: '/contacts',
  config: {
  	tags: ['api'],
  	plugins: {
      'hapi-swagger': {
        responses: {
          400: {
            description: 'Bad request'
          },
          409: {
            description: 'User with given name/surname exists'
          }
        }
      }
    },
  	description: 'Create a new contact',
    notes: 'Returns created contact',
    response: {
      schema: Joi.object({
        contact: {
          name: Joi.string().required().example('Jan'),
          surname: Joi.string().required().example('Kowalski')
        }
      }).label('Testowy obiekt')},
    validate: {
      payload: Joi.object({
        contact: Joi.object({
          name: Joi.string().required(),
          surname: Joi.string().required()
        }).required()
      })
    }
  },
handler(request, reply) {  
  const contact = request.payload.contact;

  const userExists = contacts.find(c => c.name === contact.name && c.surname === contact.surname);
  if (userExists) {
    return reply('This user exists!').code(409);
  }

  contacts.push(contact);
  reply({contact}).code(201);
}
});

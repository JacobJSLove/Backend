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
    reply({
      contacts
    });
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

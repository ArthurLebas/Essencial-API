const ecovillageDatamapper = require('../../datamappers/Ecovillage');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const ecovillageController = {

    async getAllWithPhotos(req,res){
        try {
            const ecovils = await ecovillageDatamapper.findAllWithPhoto()
            if(!ecovils){
                return res.json({message: "There is no ecovillage on BDD"})
            }    
            return res.json(ecovils)
        } catch (error) {
            res.status(400).json({error: error})
        }

    },

    async getOneWithPhoto(req,res){
        const ecovilId = req.params.id
        try {
            if(!ecovilId){
                throw new Error("You must specify an id")
            }

            const result = await ecovillageDatamapper.findOneWithPhoto(ecovilId)

            if(!result){
                return res.json({message:`There is no ecovillage with id ${ecovilId}`})
            }

            return res.json(result)

        }catch(error){
            return res.status(400).json({error: error.message})
        }
    },

    async createOneWithPhoto(req,res) {
        const ecovil = req.body

        const salt = bcrypt.genSaltSync(parseInt(process.env.HASH_SALT_ROUNDS));
        const hash = bcrypt.hashSync(ecovil.password, salt);

        ecovil.password = hash

        try {
            if(!ecovil){
                throw Error("you must send data to create an ecovillage")
            }
            if(!ecovil.path){
                throw Error("you must send a photo")
            }
            const result = await ecovillageDatamapper.createWithPhoto(ecovil)
            return res.json(result)
        } catch (error) {
            return res.status(400).json({error: error.message})
        }
    },

    async deleteOne(req,res){
        const ecovilId = req.params.id

        let token = req.headers['authorization']; 
        token = token.slice(4,token.length);
        
        const jwtEcovilId = jwt.decode(token).id
        const jwtType = jwt.decode(token).type

        try {

            if(!ecovilId){
                throw Error("you must send the identifier")
            }

            if((ecovilId != jwtEcovilId) || (jwtType !== "ecovillage")){
                throw Error("you can't delete an ecovillage that is not yours")
            }

            const ecovillageToDelete = await ecovillageDatamapper.findByPk(ecovilId)
            if(!ecovillageToDelete){
                throw Error("The id does not exist")
            }

            const result = await ecovillageDatamapper.delete(ecovilId)
            return res.json({
                message: "ecovillage deleted successfully"
            })
            
        } catch (error) {
            return res.status(400).json({error: error.message})
        }
    },

    async updateWithPhotoOrNot (req,res){
        const ecovil = req.body
        let token = req.headers['authorization']; 
        token = token.slice(4,token.length);
        
        const ecovilId = jwt.decode(token).id
        const jwtType = jwt.decode(token).type

        try {            
            if(jwtType !== "ecovillage"){
                throw Error("you can't update an ecovillage that is not yours")
            }
            if(!ecovil){
                /* throw Error("you must send an ecovillage") */
                return res.json({message:"There is no data to update"})
            }
            const result = await ecovillageDatamapper.updateWithPhotoOrNot(ecovilId,ecovil)
            return res.json(result)
        } catch (error) {
            return res.status(400).json({error: error.message})
        }
    },

}

module.exports = ecovillageController
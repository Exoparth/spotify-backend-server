// ! Commented Code have been replace with auth middle ware which is more efficient and clean way to handle authentication and authorization in the application. The auth middleware will check for the presence of a valid token and verify the user's role before allowing access to the protected routes. This approach helps to keep the controller code clean and focused on handling the business logic, while the authentication and authorization logic is handled separately in the middleware.
const { json } = require('express');
const musicModel = require('../models/music.model');
const jsonwebtoken = require('jsonwebtoken');
const {uploadFile} = require('../services/storage.service')
const albumModel = require('../models/album.model');

async function createMusic(req,res){
    // const token = req.cookies.token;
    // if(!token){
    //     return res.status(401).json({message: "Unauthorized"})
    // }
    // try {
    //     const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    //     if(decoded.role !== 'artist'){
    //         return res.status(403).json({message: "You don't have permission to perform this action"})
    //     }
    
    const{title} = req.body;
    const file = req.file;

    const result = await uploadFile(file.buffer.toString('base64'));
    const music = await musicModel.create({
        uri: result.url,
        title,
        artist: req.user.id
    })

    res.status(201).json({
        message: "Music uploaded successfully",
        music: {
            id: music._id,
            uri: music.uri,
            title: music.title,
            artist: music.artist
        }
    })
    // } catch (error) {
    //     console.log('====================================');
    //     console.log(error);
    //     console.log('====================================');
    //     return res.status(401).json({message: "Unauthorized"})
    // }
}

// async function createAlbum(req,res){
//     // const token = req.cookies.token;
//     // if(!token){
//     //     return res.status(401).json({message: "Unauthorized"})
//     // }
//     // try {
//     //     const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
//     //     if(decoded.role !== 'artist'){
//     //         return res.status(403).json({message: "You don't have permission to perform this action"})
//     //     }
//         const {title, musics} = req.body;
//         const album = await albumModel.create({
//             title,
//             musics: musics,
//             artist: req.user.id
//         })

//         res.status(201).json({
//             message: "Album created successfully",
//             album: {
//                 id: album._id,
//                 title: album.title,
//                 musics: album.musics,
//                 artist: album.artist
//             }
//         })
//     // } catch (error) {
//     //     console.log('====================================');
//     //     console.log(error);
//     //     console.log('====================================');
//     //     res.status(401).json({message: "Unauthorized"})
//     // }
// }

async function createAlbum(req,res){
    const { title } = req.body;
    const files = req.files;

    const musicIds = [];

    for (let file of files) {
        const result = await uploadFile(file.buffer.toString('base64'));

        const music = await musicModel.create({
            uri: result.url,
            title: file.originalname,
            artist: req.user.id
        });

        musicIds.push(music._id);
    }

    const album = await albumModel.create({
        title,
        musics: musicIds,
        artist: req.user.id
    });

    res.status(201).json({
        message: "Album created successfully",
        album
    });
}

async function getAllMusics(req,res){
    const musics  = await musicModel
    .find()
    .limit(2)
    .populate('artist',"username email")

    res.status(200).json({
        message: "Musics fetched successfully",
        musics: musics,
    })
}

async function getAllAlbums(req,res){
    const albums = await albumModel.find().select("title artist").populate('artist', "username email")

    res.status(200).json({
        message: "Albums fetched successfully",
        albums: albums
    })
}

async function getAlbumById(req,res){
    const albumId = req.params.albumId;

    const album = await albumModel.findById(albumId).populate('artist', "username email").populate('musics')

    return res.status(200).json({
        message: "Album fetched successfully",
        album: album
    })

    
}

async function getMyMusics(req,res){

    const musics = await musicModel
        .find({ artist: req.user.id })
        .populate("artist","username email");

    res.status(200).json({
        message: "My musics fetched successfully",
        musics
    });
}

async function getMyAlbums(req,res){

    const albums = await albumModel
        .find({ artist: req.user.id })
        .populate("artist","username email");

    res.status(200).json({
        message: "My albums fetched successfully",
        albums
    });
}


module.exports = {
    createMusic,createAlbum,getAllMusics,getAllAlbums,getAlbumById,getMyMusics,getMyAlbums
}
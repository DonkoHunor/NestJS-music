import { Body, Controller, Get, Post, Render, Res} from '@nestjs/common';
import * as mysql from 'mysql2';
import { AppService } from './app.service';
import { SongDTO } from './Song';
import { Response } from 'express';

const conn = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'database',
}).promise();

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  async index() {
    const [songs] = await conn.execute("SELECT title,artist,length FROM songs ORDER BY artist, title");
    return {songs};
  }

  @Get("/newSong")
  @Render("songForm")
  form() {
    return {error: '',title:'',artist:'', length:0};
  }

  @Post("/newSong")
  @Render("songForm")
  async formPost(@Body() song: SongDTO, @Res() response: Response) {
    const title = song.title;
    const artist = song.artist;
    const length = song.length;

    let error = '';
    
    if(title.trim().length < 1){
      error = 'All fields are required!';
      return {error ,title:'', artist, length};
    }
    if(artist.trim().length < 1){
      error = 'All fields are required!';
      return {error, title, artist:'', length};
    }
    if(!length){
      error = 'All fields are required!';
      return {error, artist, title, length};
    }
    if(length < 3){
      error = 'The length must be longer than 3sec!'
      return {error, title, artist, length}
    }
    else{
      const [result] = await conn.execute('INSERT INTO songs (title,artist,length) VALUES (?,?,?)',[title,artist,length]); 
      console.log(result);
      response.redirect('/');
    }
    return {};
  }
}

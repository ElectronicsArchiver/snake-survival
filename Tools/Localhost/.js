
import { Application , Router } from 'Oak'

const { readTextFile } = Deno;


const app = new Application;

const router = new Router;

router.get('/',sendPage);
router.get('/js/:file',sendJS);
router.get('/img/:file',sendMedia);

app.use(router.routes());

await app.listen({ port : 8080 });



async function sendPage(context){
    await sendFile(context,'index.html');
}

async function sendJS(context){
    await sendFile(context,`js/${ context?.params?.file }`);
}

async function sendMedia(){
    await sendFile(context,`img/${ context?.params?.file }`);
}


async function sendFile(context,path){
    await context.send({
        root : `${ Deno.cwd() }/Source`,
        index : path
    });
}
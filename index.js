import express from 'express';
import cors from 'cors';
import urlMetadata from "url-metadata";

const app = express()
const inMemory = new Map()
app.use(cors())
app.use(express.json())
app.get('/', async (req, res) => {
    const { shared_links } = req.body
    const links_metadata = []
    let returnedData;
    for (let i = 0; i < shared_links.length; i++) {
        if (inMemory.has(shared_links[i].url)) {
            links_metadata.push({ metadata: inMemory.get(shared_links[i].url), id: shared_links[i].id })
        } else {
            try {
                const metadata = await urlMetadata(shared_links[i].url);
                returnedData = {
                    link_title: metadata.title,
                    link_description: metadata.description,
                    link_image: metadata.image
                }
            } catch (error) {
                console.error(`Error to obtain metadata for URL: ${shared_links[i].url}`, error);
                returnedData = {
                    link_title: null,
                    link_description: null,
                    link_image: null
                }
            }
            finally {
                links_metadata.push({ metadata: returnedData, id: shared_links[i].id })
                inMemory.set(shared_links[i].url, returnedData)
                returnedData = ""
            }
        }
    }
    res.send(links_metadata)
})

app.listen(process.env.PORT || 4000)
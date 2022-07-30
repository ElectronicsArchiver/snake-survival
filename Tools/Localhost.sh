

clear


deno run                                        \
    --allow-read                                \
    --allow-write                               \
    --allow-net                                 \
    --importmap=Tools/Localhost/Imports.json    \
    Tools/Localhost/.js
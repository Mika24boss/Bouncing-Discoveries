# Bouncing Discoveries

### Final Art Project for IFT 6256 - Algorithmic Art Course at UdeM

### By Supernova (Jessey Thach and Michaël Gugliandolo)

<hr>

### Description

*Bouncing Discoveries* is an interactive piece where the player is a ball falling through different worlds, reflecting the steps of our journey in this class. The abstract world comes first, representing confusion and curiosity. Everything looks new as we understand how code fits with art. Then, we have the matrix where we learn how to code and produce generative art. This is followed by the ocean; we must navigate obstacles against the current. Finally, we end up in space. We have succeeded in creating a beautiful art piece, just as this class has opened our minds to a wonderful new world.

In our art piece, every world (biome) has a unique background music. As well, the piece automatically starts and restarts. At the beginning, a claw will pick a random ball from a ball pool and drop you into the next biome. In the abstract biome, you can enjoy the parallax while bouncing on the rectangles on your way down. In the matrix biome, the code dynamically avoids the ball, while random characters glitch out and become Japanese! In the ocean biome, fish swim upwards, following the currents and avoiding the boulders. In the space biome, the captivating galaxy is surrounded by asteroid belts and nebulae.

### Controls

PlayStation and Xbox controllers:

- Left joystick: move ball
- OPTIONS (START for Xbox): pause

Keyboard:

- WASD or arrow keys: move ball
- SPACE: pause

### Algorithms Used

The start biome uses **hexagonal packing**. The abstract biome uses **physics** for collisions and **parallax**. The matrix biome uses **recursion**. The ocean biome uses a **flow field**. The space biome uses **trigonometry**, **collisions** and **Perlin noise**.

### How to Run

To run the project, opening `index.html` directly in your web browser may fail due to the browser's CORS policy blocking the file imports. Instead, you can use VS Code with the "Live Server" extension: right-click `index.html` and select "Open with Live Server".

<br>
<hr>
<br>

### Description

*Bouncing Discoveries* est une œuvre interactive où le joueur est une balle qui tombe à travers différents mondes, reflétant les étapes de notre parcours dans ce cours. Le monde abstrait apparaît en premier, représentant la confusion et la curiosité. Tout est nouveau pendant que nous découvrons comment intégrer le code et l'art. Ensuite, nous avons le monde de la Matrice où nous apprenons à coder et à produire de l'art génératif. Cela est suivi par l'océan; nous devons naviguer entre les obstacles contre le courant. Enfin, nous arrivons dans l'espace. Nous avons réussi à créer une belle œuvre d'art, tout comme ce cours a ouvert notre esprit à un merveilleux nouveau monde.

Dans notre œuvre, chaque monde (biome) possède une musique de fond unique. De plus, l'œuvre démarre et redémarre automatiquement. Au début, une pince choisit une balle aléatoire dans une piscine à balles et vous laisse tomber dans le biome suivant. Dans le biome abstrait, vous pouvez apprécier la parallaxe en rebondissant sur des rectangles durant votre descente. Dans le biome de la Matrice, le code évite dynamiquement la balle tandis que des caractères aléatoires se mettent à buguer et deviennent japonais! Dans le biome océanique, des poissons nagent vers le haut, suivant les courants et évitant les rochers. Dans le biome spatial, la galaxie captivante est entourée de ceintures d'astéroïdes et de nébuleuses.

### Contrôles

Manettes PlayStation et Xbox:

- Joystick gauche: déplacer la balle
- OPTIONS (START sur Xbox): pause

Clavier:

- WASD ou flèches: déplacer la balle
- ESPACE: pause

### Algorithmes utilisés

Le biome de départ utilise **l'empilement hexagonal**. Le biome abstrait utilise la **physique** pour les collisions et la **parallaxe**. Le biome de la Matrice utilise la **récursion**. Le biome océanique utilise un **champ de flux**. Le biome spatial utilise la **trigonométrie**, les **collisions** et le **bruit de Perlin**.

### Comment exécuter

Pour exécuter le projet, l'ouverture de `index.html` directement dans votre navigateur web peut échouer à cause de la politique CORS qui bloque l'importation des fichiers. À la place, vous pouvez utiliser VS Code avec l'extension "Live Server": faites un clic droit sur `index.html` et sélectionnez "Open with Live Server".

<br>
<hr>
<br>

# Examples/exemples

<img alt="Start biome screenshot" src="/Examples/start.jpg" />
<img alt="Abstract biome screenshot" src="/Examples/abstract.jpg" />
<img alt="Matrix biome screenshot" src="/Examples/matrix.jpg" />
<img alt="Ocean biome screenshot" src="/Examples/ocean.jpg" />
<img alt="Space biome screenshot #1" src="/Examples/space1.jpg" />
<img alt="Space biome screenshot #2" src="/Examples/space2.jpg" />

# Sources

### Music/musique

- Start/début: [8 Bit Retro Funk - by David Renda](https://www.fesliyanstudios.com/royalty-free-music/download/8-bit-retro-funk/883)
- Abstract/abstrait: [The Return Of The 8-bit Era - by DJARTMUSIC](https://pixabay.com/music/video-games-the-return-of-the-8-bit-era-301292/)
- Matrix/Matrice: [Dark Ambient Soundscape - by LemonMusicLab](https://pixabay.com/music/mystery-dark-ambient-soundscape-505384/)
- Ocean/océan: [sea - by uchihadace1st](https://pixabay.com/music/modern-classical-sea-396080/)
- Space/espace: [Tell Me Your Story - by Antavel](https://www.youtube.com/watch?v=fclRlVybd6Q)

### Code

- Fish adapted from / poissons adaptés de [PP005: Koi Pond by brytlao](https://editor.p5js.org/brytlao/sketches/um2WVvzaN)
- Galaxy adapted from / galaxie adaptée de [Spiral Galaxy Simulation by Acuzito55](https://editor.p5js.org/Acuzito55/sketches/zLIUJ1Bmg)

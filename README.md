# Algo génétique

Génotype : l'ensemble des informations génétiques d'un individu

Phéntoype : l'ensemble des gènes/caractéristiques exprimé(e)s

Jérémie Metter-Rothan - IMAC3

Demo : [disponible ici](http://projects.metter-rothan.fr/genetic-threejs/)


## 1. Définir les caractéristiques :
- Nb de pieds (1 à 6)
- Inclinaison dossier (0 à 90)
- Taille de l’assise (20 à 200)
- Hauteur du dossier (40 à 60)
- Hauteur des pieds (50 à 80)


## 2. Génotype :
000|111|0101|010|101 => 16 bits


## 3. Créer une population de génotypes de chaise :
Ex : 25 chaises (random) 25 * 16 bits


## 4. Fonction de génotype :
-> décode le génotype
-> representation 3D de la chaise


## 5. Mutations
-> fonction de mutation
-> random(16) : on change le bit 0 en 1 et inversement


## 6. Crossover (recombinaison)
-> sélect de 2 génotypes
-> random(16)
-> cut de 2 génotypes à la position random
-> on obtient 2 enfants grâce à la recomposition des génotypes


## 7. Fitness
-> paramètres cibles vers lesquels l’algo converge :
•	Chaises à 4 pieds
•	45° angles
•	50 cm assise
•	60 cm de hauteur de pieds


## 8. Sélection des parents
2 méthodes :
•	Roulette
•	Tournois


## 9. Evaluation d’1 chaise
F = [100 100 0010 100 010]
C42 = [110 101 0100 011 111] 
F(C42) soustraction => 9 bits différents


## 10. On fait une boucle avec les étapes :
e9. pour toutes les chaises

e8. parents (x fois)

e6. enfants (crossover)

e5. mutants (mutation)

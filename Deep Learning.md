# Themen
## Introduction
### Was ist Machine Learning?
- Ein Programm lernt von experience "E" in hinsicht auf die klassen der aufgabe "T" und der Performance Metrik "P"
- Wenn die Leistung bei Aufgaben in "T", gemessen an "P", sich mit der erfahrung "E" verbessert ist es "lernfähig"
### Styles of Learning
- Supervised:
	- Trainingdaten mit gelabelten in/output pairs.
	- Lernt beziehungen zwischen in-output

- Unsupervised:
	- Ohne Label
	- Findet plausible kompakte beschreibung der daten
- Anomaly Detection:
	- Mit oder ohne label
	- Unterscheiden zwischen erwateten und unerwateten daten
- Reinforcement Learning:
	- Belohnungsbasiert
- Semi-Supervised:
	- Kleine menge gelabeled der rest unlabled

### Supervised
- Datensatz gegeben -> Die aufgabe die relation zwischen In und Output lernen sodass bei einem neuen input der predicted output akkurat ist (generalisierung)
- Modelle:
	- Regression: bsp. Aktienkurse vorhersagen, vorhersagen über kontinuierliche ausgabewerte auf basis von eingabewerten (Mean Squared Error, MSE)
	- Klassifizierung: Eingabedaten in vordefinierte Klassen einordnen (Cross-Entropy Loss)
	- Feature Extraction: Haar Features / SVM+HOG
- Modell Typen:
	- **Diskriminative Modelle** lernen die Grenze zwischen den Klassen und konzentrieren sich darauf, die Wahrscheinlichkeit der Klassenzugehörigkeit basierend auf den Eingabedaten zu bestimmen.
	- **Generative Modelle** lernen die zugrundeliegenden Wahrscheinlichkeitsverteilungen der Daten für jede Klasse und können neue Datenpunkte generieren, die den echten Daten ähnlich sind.
- Sonstiges:
	- Generalisierung: Overfitting ist ein problem -> Daten werden auswendig gelernt und neue daten passen somit nicht ins modell.
- Evaluation von Klassenproblemen
	  

| Conf. Mat. | y^(i) = 1 | y^(i) = -1 |
| ---- | :--: | :--: |
| f(x^(i)) = 1 | TP | FP |
| f(x^(i)) = -1 | FN | TN |
TP Rate = TP / (TP + FN)
FP Rate = FP / (FP + TN)
Accuracy = (TP + TN) / (TP+FN+FP+TN)

Alternativ: ROC Kurve (Reciever Operating Characteristic)

Um Overfitting zu vermeiden: early stop wenn MSE zu hoch geht

### Unsupervised
- Kompakte beschreibung von datenpunkten finden. Es ist möglich vorzugeben z.B. wieviele klassen es gibt.
- Möglichkeit hierfür: Datenpunkte clustern
### Reinforcement
- Belohnungs/Bestrafungs Prinzip

## Perceptron
### Was ist ein Perceptron
- Ein simples ANN (Artificial Neural Network)
- Besteht aus Inputs (x), Gewichtsvektoren (w) und bias (b)
- zudem wird eine aktivierungsfkt (direkt auf jede ausgabe manchmal auch im output layer)
- **Trick**: Zusätzlicher Eingang: Input 1 und gewicht = bias -> somit kann das bias als weight behandelt werden.
### Ablauf:
- Inputs mit Gewichten Multiplizieren (Layerweise)
- Aufsummieren
- In die Akt. Fkt
	- Entscheiden ob feuern oder nicht
- Dann dasselbe layer für layer bis zum output
### Was kann ein Perceptron abbilden
- Hyperplane entscheidungsfläche in n-Dimensionalen räumen (Einen n-dim. raum in zwei teile teilen)
- Boolsche Funktionen
	- AND/NAND, OR/NOR
	- nicht XOR! (Lösbar mit mehreren Perceptrons)
### Lernregeln
- Beginne mit random gewichten
- perceptron auf trainingsbeispiele anwenden
- gewichte anpassen wenn falsch klassifiziert
- wiederholen bis korrekt klassifiziert
- (konvergiert bei kleiner learning rate und linear separablem trainingset)
### Delta Rule
- Ziel: Fehler minimieren durch anpassen der gewichte
- Wenn nicht linear separabel dann konvergiert die delta regel zu einer best-fit approximation
- Verwendet den Gradientenabstieg und ist die basis für backprop.
- 2 Formeln:
	- DeltaWi = DeltaWi + Lernrate x (Zielwert y - Ausgangswert y-hat) x Einganswert Wi
	- Wi = Wi + deltaWi
- Gradientenabstieg:
	- kommt bei loss
## Multi Layer Perceptron
- Gründe
	- Lineares neuron kann nur linerare entscheidungsflächen abbilden
	- Kombinationen von Linearen ergebnissen ergeben lineare ergebnisse
	- Wir wollen nicht lineare Funktionen abbilden, Perceptron mit Threshold ist nicht linear aber nicht differenzierbar
	- MLP können komplexe entscheidungsfkt abbilden
- Hierfür muss eine nicht lineare Aktivierungsfkt her
	- Ableitung von signum = 0 -> Ungeeignet!
	- Sigmoid (logistische fkt) -> σ(x)=1/(1+e^−ax) desto größer a desto steiler
		- Ableitung = dxdσ​=σ(x)⋅(1−σ(x)) kommt von kettenregel
	- RELU
	- Tanh
	- sonstiges
- Forwardprop:
	- Z1=Gewichtsmatrix x Eingabeneuronen (vektor) + biasvektor  [Weg von Input zu hidden]
	- A1(aktivierung) = Aktivierungsfkt(Z1)
	- Zout = Gewichtsvektor x A1 + biaswert [Weg von hidden zu output (annahme 1 neuron out weshalb gewichtsmatrix ein vektor ist und der biaswert kein biasvektor ist)]
	- Aout = Aktivierungsfkt(Zout) [Der eigentliche output]
- Backprop:
	- MSE berechnen= 0,5(tatsächliche_ausgabe -  Aout)^2 -> Tatsächlich bedeutet hier aus den testdaten oder auch "zielwerte"
	- Fehler der Augabeschicht berechnen
		- δoutput​=(tatsächliche_ausgabe−Aout​)×Aout×(1−Aout​) -> Hierbei ist × das elementweise Produkt, die rechnung ist die ableitung von sigmoid
	- Fehler der Hidden Layer:
		- δhidden​=(W2​⋅δoutput​)×A1​×(1−A1​)
	- Anpassen der gewichte:
		- W2​=W2​−α⋅A1​T⋅δoutput
		- ​b2=b2−α * δoutput
		- W1​=W1​−α⋅XT⋅δhidden​
		- b1=b1−α⋅δhidden​
			- α die Lernrate.
			- δoutput​ der Fehlerterm der Ausgabeschicht.
			- A1​ die Ausgabe der verborgenen Schicht. T= Transponiert
	- Die hier beschriebene methode ist der SGD (Stochastic Gradient Descent)
- Konvergenz von Backpropagation
	- Konvergenz zu lokalen minima nicht garantiert
	- Verbesserungen:
		- mini batch learning
		- andere Gradient Descent optimierungen: _**Momentum**_[wichtig, kommt noch], Adagrad, Adadelta, RMSProp, Adam
		- andere Akt.Fkt. : ReLu, Leaky ReLu, Softmax
		- andere kostenfkt. : kreuzentropie
		- Komplexität senken: Regularisierung, Dropout, Multi Column Nets
### Herleitung Backprop
Ich glaube man fährt recht safe wenn man sagt dass die backpropagation auf der kettenregel der differenzialrechnung basiert. Also wird für jedes Gewicht Wij (von neuron i zu neuron j) die ableitung bzw. der gradient ∂E/∂Wij berechnet. Hierbei muss man dann auch auf die Akt.Fkt achten, da diese auch abgeleitet wird.
Dann Gewichtsanpassung (inder die deltaregel enthalten ist -> Beachten dass diese sich unterscheidet für hidden und output neuronen)
## Loss Functions
### Maximum Likelihood Estimation (MLE)
- Berücksichtigt nicht das Vorwissen (Prior)
- $θML = arg max (θ) p(X|θ) = arg max (θ) \prod_{d} p(x ^{(d)} |θ)$
- Parameter $θ$ werden geschätzt sodass die wahrscheinlichkeit der beobachteten daten maximiert werden -> $θML$
- wird durch maximierung der Likelihood funktion $p(X|θ)$ 
	- X -> Menge der beobachteten daten
	- $θ$ -> Modellparameter 
-  $arg max (θ) \prod_{d} p(x ^{(d)} |θ)$ bedeutet die wahrscheinlichkeiten aller einzelbeobachtungen werden multipliziert um eine gesamtwahrscheinlichkeit zu erhalten
### Maximum a Posteriori Estimation (MAP-Estimate)
- Berücksichtigt das Vorwissen
- $p(X|θ)$ -> Posterior Wahrscheinlichkeit
- $p(x|θ)  p(θ)$ -> Likelihood der daten mit Prior Wahrscheinlichkeitsdaten (der $p(θ)$ teil)
- Ziel ist es $θ$ zu finden der das produkt aus likelihood und prior maximiert -> was als Posterior wahrscheinlichkeit gilt.
- Im gegensatz zu MLE berücksichtigt MAP Vorwissen (prior) der parameter in der prior verteilung, während MLE nur die likelihood der daten betrachtet
- Ergebnis: Ausgewogene schätzung der parameter
### Logistische Regression für Klassifikationsprobleme
1. Funktion wählen welche unsere daten auf eine klasse abbildet
		Sigmoid akt.fkt: $yHat(x) = g(z) =  σ(w^{(T)}x)$ wobei $z=w^{T}x$
		$w^Tx$ = Produkt der gew. matrix mit dem eingabevektor x
2. Ein Modell erstellen für $p(y|x,w)$ 
		Anhand der eingabedaten x und den parametern w die wahrscheinlichkeit für ausgang y vorhersagen
		Also:
			$p(y=1|x,w) = yHat(x)$ -> Klasse 1 hat die wahrscheinlichkeit bsp. 0,8
			$p(y=0|x,w) = 1-yHat(x)$ -> Klasse 0 hat die wahrscheinlichkeit 1 - 0,8 = 0,2
			Oder als Bernoulli verteilung:
			$p(y|x,w) = (yHat(x))^y(1-yHat(x))^{1-y}$
3. Die Parameter der funktionen finden
	   Mithilfe von MLE
	   $l(w)=p(Y|X,w)$
		   Y = Matrix der zielvariablen
		   X = Matrix der Eingabedaten
		   w = gewicht
		$l(w)=\prod_{d} p(y^{(d)}|x^{(d)},w)$ 
		$= (yHat(x^{(d)}))^{y^{(d)}} (1 - yHat(x^{(d)}))^{1-y^{(d)}}$
		$=\prod_{d}(yHat(x^{(d)}))^{y^{(d)}}(1-yHat(x^{(d)}))^{1-y^{(d)}}$
		Alle wahrschreinlichkeiten aufmultiplizieren um eine gesamtwahrscheinlichkeit zu erhalten	
		Loss funktion wird L(w) = -ln l(w) (neg. log. likelihood)
4. Gradient descent um den fehler zu minimieren
		Ziel: $wHat = argmin_{(w)} L(W)$
		Ansatz: $w:= w-α*grad_w(L(w))$
			- $α$ = Lernrate
			- L(w) = Lossfkt (negLogLikelihood)
		Wie bekommen wir $grad_{w}L(w)$?
		-> Ableitung von L(w) nach w (kettenregel)
		$\frac{∂L(w)}{∂wi} =  \sum_d \frac{∂L(w)}{∂yHat(x^{(d)})} * \frac{∂yHat(x^{(d)})}{∂wi}$
		(den rest selber nachgucken, ist mir zu fummelig hier)
		jedenfalls: neg log likelihood nach yHat(netzausgabe) ableiten, yHat nach w (gewichte/parameter) ableiten.
		In leicht:
		- Gradient der Verlustfunktion (negLogLikelihood) im bezug auf den output bestimmen
		- Gradient des outputs in bezug auf gewichte bestimmen
5. Die eigentliche fehler minimierung mit der Delta Regel
	- Delta Regel für die gewichtsanpassung:
		- $wji = wji + ∆ wji$
		- $∆wji = -\alpha \frac{\partial{L(d)}}{\partial{wji}} = \alpha(yj - yHatj)*hji$
		- $\alpha$ = lernrate
		- yj = tatsächlicher output
		- yHatj = predicted output (netzoutput)
		- hji = der wert der nach vorne propagiert wurde
		- wji = gewichte zwischen neuronen j und i
### Unterschied zwischen Loss Funktionen
- Cross Entropy:
	- +Effektiv bei klassifizierungsproblemen (binär oder multiklassen)
	- +Vermeidung der Lernverlangsamung durch hohe penaltys
	- -Eher ungeeignet für regressionsprobleme da erwartet wird dass die ausgaben wahrscheinlichkeitsverteilungen sind
- Quad. Fehler:
	- +Leicht implementiert
	- +Geeignet für regression
	- -Langsameres Lernen bei falschen Vorhersagen (durch den vergleichsweise kleinen penalty)
	- -Anfällig für ausreißer -> Fehler werden quadriert und ausreißer werden stärker gewichtet was zur übermäßigen anpassung führt
	
## Activation Functions

### Deep Learning(Warum Jetzt?)
- Große Datensätze sind nötig um alle parameter eines Deep Neural Nets zu trainieren
- Jetzt ists möglich, da wir die rechenleistung haben
- sonst hat sich eigentlich nicht viel geändert
- Einfach Multi Layer Nets verwenden mit ein paar verbesserungen
- Neue dinge die zu beachten sind:
	- Vanishing Gradient
		- Der gradient nimmt exponentiell mit n (bei einem n-layer tiefen net) ab
		- Grund: Kettenregel in der backpropagation
			- Sigmoid besonders anfällig da die ableitung einen wertebereich von 0-0,25 hat
			- Tanh hat 0-1 und ist trotzdem betroffen aber nicht so anfällig
			- Kleine werte der ableitung der Activation Func. -> werden nach hinten propagiert
			- $w11*w21*...*0.25$ <- die 0.25 verkleinert die werte fortlaufend sodass bei frühen layern der gradient gegen 0 geht und "verschwindet"
			- 
	- Overfitting
		- Das netz lernt eingaben auswendig und kann nicht effizient verallgemeinern
		- Loss ist vielleicht für die aktuellen daten minimal aber neue daten sind nicht verwendbar
  
### Neurale Netze zur Klassifikation
- Probleme: Binäre Probleme sind lösbar, Multiklassen Probleme aber nicht weil die wahrscheinlichkeit nicht mehr 1 ergibt da sie keine wahrscheinlichkeiten mehr sind
#### Lösungen:
- Softmax
	- Für jede klasse wird die exponentialfkt des eingabewerts berechnet
	- die exponierten werte werden dann durch die summe der exponentialwerte aller klassen geteilt
	- Durch diese normalisierung wird sichergestellt dass die summierten wahrscheinlichkeiten =1 sind
	- $Softmax(Zi) = \frac{e^{(Zi)}}{{∑ e^{(Zk)}}}$
		- e = basis des nat log.
		- zi = eingabewert (Logit) für klasse I (oder k, jenachdem)
### Unterschiedliche Aktivierunsfkt
- Sigmoid: 
	- + simple ableitung
	- + Bildet im wertebereich eine wahrscheinlichkeit ab 0-1 -> kann leicht interpretiert werden
	- -Sättigung, da werte zwischen 0-1 liegen, nehmen ist der gradient für extreme werte nahezu null
	- - Vanishing gradient bei diesen fällen
	- - nicht null zentriert
- Tanh:
	- So wie sigmoid nur null zentriert (wertebereich zw. -1 und 1)
	- Tanh vor sigmoid präferieren
- ReLU:
	- Einfache Threshold fkt
	- $g(z) = z \ wenn\  z>0 | 0 \ wenn \ z\leq 0$
	- $g'(z) = 1 \ wenn\  z>0 | 0 \ wenn \ z\leq 0$
	- + simpel (geringer berechnungsaufwand)
	- + schnelle konvergenz
	- + keine sättigung für z>0
	- + sparse(genaue erklärung muss ich noch finden )
	- - z <= 0 kein gradient -> multiplikation mit null -> tote neuronen die nie mehr feuer
- SReLU
	- Sifted Rectified Linear Unit
	- Relu nur nach unten verschoben sodass:
	  - $g(z) = z \ wenn\  z>0 | -1 \ wenn \ z\leq 0$
	  - $g'(z) = 1 \ wenn\  z>0 | 0 \ wenn \ z\leq 0$
	  - Vorteil ggü Relu: Mehr aktive neuronen (kein dying relu problem)
- Leaky ReLU 
	- Untere  grenze wird mit einer konstanten initialisiert, sodass ein kleiner positiver gradient entsteht 0.01 z.b
	- $g(z) = z \ wenn\  z>0 | 0.01x \ wenn \ z\leq 0$
	- $g'(z) = 1 \ wenn\  z>0 | 0.01 \ wenn \ z\leq 0$
- ELU
	- Exponentielle linear units
	- eigentlich nur abgerundete SReLUs
	- $g(z) = z \ wenn\  z>0 | a(e^x-1) \ wenn \ z\leq 0$
	- $g'(z) = z \ wenn\  z>0 | a*e^x \ wenn \ z\leq 0$
- Maxout
	  max(ReLU1,ReLU2)
## Optimization
### Gewichtsinitialisierung
- Gewichte sollten nicht mit null initialisiert werden -> 0 Werte werden propagiert und kein lernen ist möglich
- Möglichkeiten (sigmoid akt.):
	- sampeln aus der xavier verteilung:
	- numberInput: input in die jeweilige schicht bspw. bei hidden2 ist hidden1 die inputschicht
	- -> $\sqrt(\frac{6}{numberInput+numberOutput})$
	

| Aktivierung | Uniform(-r, r) | Normal(0, σ^2) |
| ---- | ---- | ---- |
| Sigmoid | r = sqrt(6 / (ni + no)) | σ = sqrt(2 / (ni + no)) |
| Tanh | r = 4 * sqrt(6 / (ni + no)) | σ = 4 * sqrt(2 / (ni + no)) |
| ReLU | r = sqrt(2) * sqrt(6 / (ni + no)) | σ = sqrt(2) * sqrt(2 / (ni + no)) |
- `ni` = Anzahl der Eingänge (fan-in) 
- `no` = Anzahl der Ausgänge (fan-out)
### Normalisierung/Standardisierung von daten
- Warum?
	- Verbesserte Konvergenz, da gewichte und fehlergradient gleichmäßiger verteilt wird
	- Vermeidung von Numerischen Instabilitäten (Große eingabe werte-> Exploding Gradient)
	- Verbesserte Lernperformance: Sehr hohe oder niedrige werte sind anfällig für sättigung bei tanh und sigmoid (daten werden somit im effektiven bereich gehalten)
	- Unterschiedliche skalen können abgebildet werden somit können werte im 0.00001 bereich als auch werte 0.1 bereich abgebildet werden
	- Leichteres finden von lernraten da weniger auf die daten geachtet werden muss
- Wie:
	- Batch Normalization auf alle netzlayer anwenden
	- Ist die normalisierung schlecht, kann sie reverted werden indem γ oder β gelernt werden.
### Hyperparameter Optimierung
- Num Hidden Units
	- Erhöhen, erhöht die repräsentative kraft des modells
	- Erhöht aber zeit und speicherkosten bei fast jeder operation des modells
- Lernrate
	- Zu hoch oder zu nierdrig führt zu schlechter optimierungsrate (overshoot/undershoot)
- Faltungskernel breite
	- Erhöhen, erhöht die parameter im modell
	- Aber die outputdimension wird schmaler was die model performance reduziert
		- kann mit implizitem zero padding entgegengewirkt werden
	- Größere kernel = mehr speicher + runtime = schmalerer output = weniger speicher?
- Implizites zero padding
	- Nullen am rand hinzufügen damit nach der faltung die output dimension erhalten bleibt
	- kostet aber zeit und speicher
- Weight Decay Coefficient
	- erlaubt bei verkleinerung die vergrößerung der parameter
- Dropout Rate
	- Seltenerer dropout -> mehr möglichkeit dass neuronen miteinander arbeiten um sich ans trainingsset anzupassen
### Automatische Hyperparameterbestimmung
- zufällig probieren indem ein wert aus einer uniform oder log uniform verteilung gewählt wird
- Bsp. Learning Rate:
	- log_learning_rate ~ u(-1,-5) -> sample aus der uniformen verteilung von -1 bis -5
	- $learningRate = 10^{logLearningRate}$
### Lernrate
- Konstant
- Zu klein -> Langsame Konvergenz
	- zudem kann man in lokalen minima feststecken
- Zu Groß -> Overshoot
- Ansätze: Lernrate über die zeit verringern (Exponential decay(half-life) oder linear)
### Alternativen zu Standard Gradient Descent
- Warum?
	- Lernen kann langsam sein und keinerlei konvergenz zeigen
	- Probleme in der fehlerfläche:
		- lokale minima: kleine lernraten können sich in kleinen lokalen minima festfahren
		- plateaus/sattelpunkte können das lernen stoppen
		- Exploding und vanishing gradient probleme
		- Ill Conditioning:
			- Der Gradient zeigt in die falsche richtung
			- Grund: Starke kurven
			- Beispiel: Ovale Gauss verteilung
			- Erkennbar durch die zweite ableitung der kostenfunktion bei w0
				- "Hessian H"
					- Ist dieser wert zu groß führt es dazu dass die kostenfunktion vergrößert wird und sich in die falsche richtung bewegt
			- Ein lösungsansatz ist: Die Hesse Matrix zu berechnen was berechnungstechnisch sehr aufwändig ist.
				- Richtige Lösungsansätze:
				- Gradienten glätten
				- Adaptive lernrate
				- beides.
- Momentum
	- Einen teil der vorherigen gewichtssupdate ins vorherige einbeziehen
		- Stabilisiert den optimierungsprozess (reduziert oszillierungen)
		- Hilft mit plateaus
	- Verhält sich wie ein ball der bergab rollt
- AdaGrad:
	- Update die parameter individuell um kleine oder große schritte zu machen
	- Große schritte = Wichtige parameter
		- Wichtigkeit nimmt ab mit der menge an großen schritten
		- $w_{t,i} = w_{t-1,i} - \frac{\alpha}{sqrt(r_{t,i}) + \epsilon}g_{t,i}$
		- $r_t = r_{t-1}+g_t\odot g_t$
		- i = parameter vom index
		- rt = vector mit summe der quadrierten gradienten bis zur zeit t
		- gt,i = der i-te gradient
		- Problem:
			- lernrate kann sehr klein werden
			- Funktioniert nicht sooo gut für Deep Learning
		- Lösung
			- Adadelta. RMSprop, Adam
- RMSProp
	- Ein Exponential Moving Average(EMA) filter wird hinzugefügt
		- Der einfluss älterer gradienten wird kleiner
		- AdaGrad+EMA
- Adam:
	- RMSProp + Momentum
	- Erste und zweite moment mit EMA filter tracken
	- Gradient richtungen mit hoher varianz haben niedrigere wichtigkeit
### Komplexität Reduzieren
- Overfitting vermeiden:
	- Trainingsdatensatz vergrößern
	- hidden layer verringern
	- Regularisierung
	- Early stopping basierend auf validation errors
	- Allgemein: Komplexität verringern
- Regularisierung:
	- Overfitting tritt auf wenn jedes input sample korrekt gemappt wird, woraus große gewichte resultieren
	- Regularisierung zwingt die gewichte klein zu bleiben
	- $LWave(w) = L(W) + \lambda \Omega(w)$
		- $\lambda$ = regularisierungs koeffizient
		- $\Omega$ = bestrafungs term
	- Dieser Bestrafungsterm kann mit ins MAP-Estimate einfließen als prior
	- Ableitung von MAE L1 Reg. ist sign(w)
- Trainieren mit noise im Input
	- zu kleines trainingset:
		- Synthetische daten hinzufügen
	- Im input noise: ähnlich zu regularisierung
	- In den hidden units => Dropout
- Trainieren mit noise im Output
	- Zielklasse ist falsch für trainingsbeispiele
	- Trainingsprozess konvergiert nie und die gewichte wachsen
	- -> "Soft Targets" oder smoothed labels verwenden
		- Sonstiges: kommt noch [TODO]
- Weight Sharing:
	- Hard-Weight-Sharing
		- Gewichte gruppieren und gesammelt anpassen, sodass sie immer die gleichen werte haben
			- Basierend auf nähe zueinander
	- Soft-Weight-Sharing
		- Gruppieren und festlegen dass die gewichte ähnliche werte haben
		- Gruppierungen werden dynamisch angepasst
	- Dropout:
		- Wir nehmen neuronen und knipsen sie random aus
			- Dadurch entsteht quasi ein neues netz sobald die neuronen aus sind "commitee of networks effekt"
			- Wirkt overfitting entgegen, da nicht "auswendig gelernt werden kann"
			- Der output der aktiven neuronen soll skaliert werden sodass die toten neuronen kompensiert werden
		- Es sollte mehrere male mit verschiedenen dropouts getan werden
		- Das ergebnis kann dann approximiert werden indem man das netz ohne dropout mit den anderen vergleicht
### Learning Outcome:
- Gründe für gewichtsinitialisierung und datennormalisierung nennen können
- Pro und Cons von verschiedenen SGD Optimierungsmethoden
- Methoden zur komplexitätsverringerung erklären und implementieren
## Convolutional Nets
### Terminologie
- Kernel -> Filter mit den gewichten der auf den input angewendet wird
- Convolution/Faltung -> Anwendungsmethode der Filter
- Feature Map -> Ergebnis der Faltung gefolgt von nichtlienarität/Aktivierungsfkt.
	- featuremap = input * kernel
- Detector Stage -> Schritt indem die Akt.Fkt auf ergebnis von Faltung angewendet wird
- Pooling: Statistisches ergebnis von featuremaps die nah beieinander sind i.d.r Mean oder Max Pooling
- Stride: Schrittweiter des Kernels
- Flattening: Vektorisierung der letzten Feature map für den input in ein MLP
- Komplexe Layer: Komposition von schritten in denen die processing layer trainierbare parameter haben
- Simple layer: Dasselbe nur alle schritte als einzeln gesehen und nicht einzeln trainierbar parameter
### Motivation
- Sparse Interactions: 
	- MLP -> Jeder Input interagiert mit jedem output
	- CNN -> Kernel kleiner als input -> Weniger Memory requirements bei vergleichbarer statistischer effizienz
- Parameter Sharing:
	- MLPs nutzen alle gewichte einmal
	- CNNs verwenden parameter/gewichte für mehr als eine funktion.
- Equivariant representations:
	- Das Parameter sharing der Faltung führt zur Equivarianz des Outcomes
	- f(g(x)) = g(f(x))
	- Aktionen können auf faltung oder input angewendet werden
### Convolution
- Sprase Interactions:
	- wenn h1 layer von einer faltung geformt wird mit einer kernelgröße von 3 werden nur 3 h1 neuronen vom inputlayer betroffen (sparse)
	- Wenn h1 layer von einer mat. mult. geformt wird, werden alle h1 neuronen vom inputlayer betroffen (nicht mehr sparse)
	- Input neuronen die aktiv  sind nennt man **rezeptives feld**
	- Das Rezeptive feld von größeren layern (deeper layers) ist größer als das von flachen layers. 
	- Direkte verbindungen sind "sparse" aber tiefe layer können indirekt mit allen oder den meisten inputs verbunden sein
- Stride
	- Stride ist die distanz zwischen zwei aufeinanderfolgenden positonen des filterkernels (stride = 1 = standard conv.)
	- Grafik hier sinnvoll
	- Bei einem h layer mit 5 neuronen und einem stride von 2 werden nur 1, 3 und 5 angesprochen
	- bei einem h layer mit 5 neuronen und einem stride von 1 werden 5 neuronen angesprochen, das kann aber auf 3 neuronen downgesampled werden
	- Grafik auch hier sinnvoll
- Filter:
	- Jeder wert der output featuremap I'(u,v) wird bestimmt durch die werte in einer region $R_{u,v}$ der input map I
	- Einen Filter drauf anwenden bedeutet eine Kreuzkorellation oder Faltung anwenden
	- Ein filter ist kommutativ weil der filter gedreht wird relativ zum input (?)
- Correlation
	- Korrelation ist nicht kommutativ
	- Viele NNs verwenden Korrelation aber nennen es Convolution
	- Vorsicht wenn filter zwischen libs konvertiert werden
- Filter Anwenden:
	- Mean filter $W =  \frac{1}{matgroesse}*Filterregion$
	- Andere filter sind Box,Gaussian,Laplace
- Boundary Probleme:
	- Filter am rand -> Keine pixel am rand
	- Lösungen:
		- 0 Padding: Schwarze pixel für fehlende elemente
		- Constant Padding: Randpixelwerte werden einfach extended
		- Periodic Repetition: Das bild wird in jede dimension einfach wiederholt
		- Boundary Vernachlässigen: nur passende filtermasken werden angewendet -> Informationsverlust -> Kleinere output dimension
		- 0,Constant und Periodic erlauben beliebig tiefe netze, da der output nicht schrumpft
- Varianten der Faltung
	- Lokale Verbindungen oder unshared convolution
		- Statt Convolution wollen wir locally connected layers
		- Gleiche graphrepläsentation wie conv. aber ohne shared params.
		- Sinnvoll wenn die features basierend auf teil des input raumes sind, diese aber nicht woanders auftreten
		- Beispiel: Face Detection -> Mund untere hälfte
	- Tilted Conv.
		- Kompromiss zw. local connections und standard conv.
		- Die kernel werden gedreht während sie sich bewegen
		- Direkt benachbarte orte haben unterschiedliche filter
		- Grafiken hier auch sinnvoll [s.30-31]
### Conv. mit Tensors
- Neuronen sind in 3d Volumina angeordnet und haben eine tiefe
- 3D Input Tensor
	- Feature map input $X_{u,v,z}$ der dimension M x N x Din
	- M = Rows
	- N = Cols
	- Din = depth/channels
- 3D Output Tensor
	- Feature map output $z_{u,v,k}$ der dimension M x N x Dout
	- Dout = Depth of output = #Kernels
- 4D Kernel Tensor
	- Der Kernel $W_{i,j,z,k}$ der Dim. K x L x Din x Dout 
	- K = Rows
	- L = Cols
	- Din = Depth
	- Dout = #Kernels 
	- zudem ein bias term der addiert wird als 1d tensor für jeden filter kernel
### Pooling
- Pooling wir nach der aktivierung angewendet
	- conv->akt->pooling
	- Zum verringern des rechenaufwandes
	- Um die Repräsentation invariant zu kleinen translationen und anderen transformationen zu machen
- Wie?
	- Die statistik der naheliegenden outputs summieren
	- Pooling fkt. (mean oder maxpool) auf pooling region anwenden
	- Stride ist idr. gleich groß wie pooling window
	- Lege Pooling maske auf region und mach pooling fkt.
		- MaxPool -> Nehm maximalen wert aus der region
		- MeanPool -> Nehm mittelwert aus region
### CNN Architekturen
- LeNet5
	- Inputs sind 0 padded und Normalisiert
		- Featuremaps sind nicht padded -> Netz wird kleiner
	- Komplexes avgpool layer
		- Neuron berechnet mean und multipliziert diesen mit trainierbarem parameter und bias
			- Ergebnis geht durch sigmoid
	- Sparse Connections
		- C3 (Faltungsnetz, layer 3) ist verbunden mit ein paar s2 maps statt allen
	- Spezielles Output Layer:
		- Dot Produkt von input und gewichtsvektor => L2 Normalisierung zw input und gewichten.
		- Output enkodiert die stärke der klassenzugehörigkeit
- AlexNet
	- Wie LeNet nur Größer und Tiefer
	- Erste Architektur mit Stacked Convolutions ohne pooling
		- Mehrere aufeinanderfolgende convolutions
	- Overfitting: Regularisierung mit 50% Dropout in F8 und F9
	- Data Augmentation: random shifts, flipping und andere beleuchtung
	- Local Response Normalization nach ReLU in C1 und C3
- GoogLeNet
	- Viel Tiefer als vorherige netze
	- Ermöglicht durch inception modules
		- Verarbeitung in verschiedenen skalen 1x1,3x3,5x5
			- Merkmale verschiedener größen werden erkannt
		- 1x1 Faltung
			- Dimensionsreduktion was die rechenkomplexität verringert
			- gegen overfitting
		- Max Pooling
			- Wichtige merkmale hervorheben
			- dimensionsreduktion
		- Konkatenation
			- Alles wird Parallel ausgeführt
			- Ausgaben werden entlang der tiefendimension zusammengeführt
	- Global average pooling statt MLP am letzten conv layer
		- Averagepooling jeder filtermap
		- Erstellt Confidence map jeder zielklasse
		- Forciert 1:1 verbindung zw. feature maps und kategorien
	- Auxiliary Classifiers:
		- Verstärker für den Gradient Descent um Vanishing gradients entgegenzuwirken
		- Werden bei klassifikation verworfen, sind nur zum training
- Microsoft ResNet
	- Connection Skips (Residual Learning)
		- input eines layers ist mit dem output eines späteren layers verknüpft
		- Beschleunigt das Training
		- Kann 0 gradienten überspringen
## Object Detection
### Klassische ansätze
- Aufgaben
	- Klassifizierung (ist da ein auto)
	- Erkennung (sind da autos/wo sind die)
	- Form Regression (Welche form?)
	- Erkennung und Regression sind viel schwerer als klassifikation
- Klassiischher Ansatz: Pattern Recognition System
	- sensor  -> preprocessing,segmentierung -> feature extraction -> classifier -> post-processing
	- Segmentation oder detection stage um initiale obj kandidaten (haar cascade bspw.) zu erhalten und die entschheidung mit komplexeren methoden verbessern (nonlin svm, cnn etc.)
- Sliding Window:
	- Entweder Unterschiedliche modelle für unterschiedliche skalierungen verwenden:
		- 1 Image, N modelle
	- Oder Bild skalieren
		- N bilder(pyramidial skaliert), 1 modell
	- Methoden:
		- Features(Haar,Gabor,HoG)
		- Classifier(SVM,Boosted Cascade)
- Objectness and Box/Obj Proposals
	- Objektvorschläge genereiren (Segmente oder B-Box) in einer art segmentierung
	- Jede detektion ist geranked indem gesagt wird wie wahrscheinlich es ein obj ist. (kanten, learned scores,..)
	- Methoden
		- Object Proposal
		- Objectness
		- selective searchh
		- Bing
		- Edge Boxes
- Fusion of Detections
	- Detektoren / Klassifikatoren sind invariant zu kleinen translatitonen und skalierungen
	- Ein Objekt produziert somit meherer detektionen welche zusammengeführt werden um eine detektion zu produzieren
	- Geclustered basiert auf overlap-faktor
	- Berechnung
		- $F1 = \frac{2*p*u}{p+u}$
		- Was dasselbe ist wie $\frac{2*TP}{2*TP+FP+FN}$
		- p = Precision
		- u = recall -> groß wenn detektion zum großteil das referenzobj enthält
		- p = precision -> groß wenn gesamtes objekt bedekt ist (auch wenn nicht obj. fläche dabei ist)
		- Die F Measure (oder overlap faktor) wird bestimmt indem mann recall und precision kombiniert -> Nur große werte wenn recall und precision groß sind.
	- Alternative:
		- IoU (Intersection over Union)
		- $\frac{TP}{TP+FP+FN}$
		- Bewirkt eine Non Maximum Suppression: 
			- Nur detektion mit maximaler confidence wird benutzt
			- Alternativ: Weighted Mean: Bilde Gewichteten Mittelwert von überlappenden detections -> evtl bessere box
- Modernere Ansätze:
	- R-CNN: Rich Feature Hierarchies for accurate obj. detection and semantic segmentation.
		- 1. Image Input
		- 2. Extract region proposals with selective search
			- Bottom up approach: Ein hierarchischer gruppierungsalgorithmus wird verwendet welche die ähnlichkeit zwischen regionen misst
		- 3+4 Feature Extraction und Klassifikation
			- AlexNet wird als feature extraction stage verwendet.
				- Jede region proposal wird skaliert und ein 4096 dim- feat. vektor wird extrahiert pro proposal
				- Jede region wird mit einem linear SVM (DOT product zwischen features und svm weights) klassifiziert
				- non max suppression um die übrigen proposals zu thresholden
				- der lokalisierungsfehler wird mit einem box regression network reduziert
		- Training:
		- Supervised Pre Training: Vortrainieren vom CNN (AlexNet) auf einem großen datensatz mit annotations was im bild ist (keine B-Box)
		- Domain Specific Fine Tuning: Klassifizierungs netz (AlexNet) mit regionsvorschlägen fine tunen (IoU > 0,5 = positiv sonst negativ)
		- Object Category Classifiers: Klassifizierungslayer wird entfernt und mit einer SVM pro klasse ersetzt. IoU > 0.3 trennt zw. positiv und negativ. Diese starken negativausreisser (negative mining) verbessern die performance
	- Fast R-CNN
		- R-CNN schneidet jede detection aus und gibt diese ins alex net
		- Fast R-CNN wird das gesamte bild durch das feature extraction network (feature sharing) gegeben
		- die ausgeschnittene featuremap wird durch ein maxpooling resized
		- (Braucht aber noch eine separate region proposal methode)
- Neueste ansätze:
	- Ganzes bild in CNN welche detektion,box regression und box klassifikation gleichzeitig  macht basierend auf einer common feature extraction
	- Statt einer separaten region proposal methode, wird die verschiebung von anchors vorhergesagt
	- Beispiele für vortrainierte feature extraction: AlexNet, VGG, Inception, ResNet etc. (meist nur faltungsschichten)
- SSD (Single Shot Detector)
	- Multi scale featuremaps für die detektion: Unterschiedliche featuremap auflösungen um objekte in verschiedenen größen zu erkennen
	- Conv Predictors for detection
- Faster R-CNN
	- Two Stage approach
	- Region Proposal Network: Klassen agnostische (hintergrund/obj) box vorhersagen indem die features von einer zwischenebene vom feature extraction netzwerk gewählt werden
	- Box Classifier: Features aus der intermediate feature map schneiden und die crops mit dem rest des extractionlayers processen. Damit wird klasse und box refinement vorhergesagt
	- Quasi SSD (3x3 Conv) mit Fast R-CNN
### Anchors
- Anchors = default boxen,  region priors
- Verschiedene boxen aufs bild legen und mittels regression die relative verschiebung und skalierung eines anchors lernen
- Wie werden Anchors auf Ground Truth gematcht?
	- Bipartit matching (1 Ground Truth : 1 Anchor)
	- argmax (viele groundtruth :  1 anchor)
	- Anchors mit niedrigem IoU (also unter threshold sind dann background/negative)
- Loss fkt: 
	- $L(a,x;W) = \alpha1\{a = pos\}*L_{loc}(ya^{loc},yHata^{loc})+ \beta * L_{cls}(ya^{cls},yHata^{cls})$ 
	- Kombinierte Loss fkt mit einem teil Localization loss (Lloc) und klassifizierungs loss (Lcls)
	- ya^loc encoding for groundtruth box "ba" matching anchor "a"
	- yHata^loc predicted box encoding
	- ya^cls class encoding of anchor a. e.g. one-hot
	- yHata^cls predicted class encoding
	- alpha and beta are weighting params
- Localization
	- anchor box a um eine predicted loc zu erhhalten
	- predicted loc wird mit ground truth box mit L2 oder L1 smoothed loss verglichen
- Box encoding
	- der gängigste ansatz ist ein log und dimensions scaling um den shiift für einen anchor zu enkodieren (box center und dimension)
	- Der  predicted 4 dim output ist -> $yHat(a)^{loc} = [ox \ oy \ ow \ oh]^T$ 
	- $o_x = (x_o-x_a)/w_a$
	- $o_y = (y_o-y_a)/h_a$
	- $o_w = ln(wo/wa)$
	- $o_h = ln(h_o/h_a)$
	- o = beschreibt den output
	- die finale box position -> $bHat_a = [x_o \ y_o \ w_o \ h_o]^T$
	- Das gleiche encoding wird dann halt auch für ground truth verwendet
## Generative Models
### Unsupervised Learning (intro)
- Kompakte beschreibung der trainingsdaten ist das ziel
- Die genauigkeit soll quantifizierbar sein
- eine gängige metrik dafür ist wie gut die generierten daten auf basis der beschreibung passen
- Ziel konkret:
	- Lerne versteckte oder latente codes/representation/struktur "h" der daten
- Beispiel:
	- Dimensionalitätsreduktion
	- representation oder lernen von features
	- clustering
- Generative Modelle können genutzt werden um daten zu generieren indem man von "p" sampled
- Density Eval: von Trainingsdaten $PHatData(x)$ kann eine model distribution p(x) estimated werden
- Bayes classifier: Verwende Class Conditional model des inputs p(x|y). Daten für jede klasse können gesampled werden
- Kalman Filter: Measurement model p(y|x) definiert dass die measurements "y" generiert wurden vom true state "x"
- Mithilfe von Generatven modellen können daten generiert werden indem man von p sampled
### Autoencoder (AE)
- Ziel: Input zum output kopieren
- Encoder: Enkodiert daten "x" -> $h=f(x)$
- Decoder: Dekodiert encoding und versucht den input zu rekonstruieren $xHat = g(h)$ 
- Wichtig: der AE braucht eine strategie um eine kopie von encoder zu decoder zu vermeiden (das wäre dann quasi overfitting)
- Kategorien:
	- Undercomplete AEs: Bottleneck verwenden sodass das encoding kleiner als der input ist
		- Der bottleneck zwingt eine komprimierte darstellung zu lernen und der Verlust $L_d$ misst wie gut der AE in der lage ist die komprimierung rückgängig zu machen
		- Anwendungen: Data Compression,  pretraining vom feature extractor
	- Regularized AEs:  Kein Bottleneck aber die code dimension kann größer oder gleichgroß wie die input dimension sein. Regularisierung erfolgt durch bspw sparsity
		- Sparse AE: Mithilfe von regularisierungstermen den hidden code sparse machen um somit nur die wichtigsten Merkmale in den Daten zu aktivieren was zu einer effektiven Merkmalsextraktion führen kann
			- NLL Loss -> Regularisierungsterm $\Omega(h)$ +const kann als prior angegeben werden als eine art penalty (?)
		- Denoising AE:
			- Sample Trainingexample x von Pdata(x)
			- Sample corrupted version x~ von Pnoise(˜x|x) (add noise to x)
			- verwende (˜x,x) als trainingsbeispiel (versuche aus verrauscht, klar zu machen)
			- $Loss = -SamplepData(x)*SamplePnoise(˜x|x)*log  \ p_{dec}(x|h = f(˜x))$ 
			- was bedeutet, dass der Verlust die negative Log-Wahrscheinlichkeit ist, dass der Decoder das ursprüngliche unverrauschte Datum x aus dem verborgenen Code ℎ rekonstruiert.
	- Stochastic Encoders and Decoders: Interpretation des encodings und decoding als verteilungen. Randomness wird integriert -> sehr nah an regularized AEs 
### Variational Autoencoder
- Komplett probabalstischer ansatz vom autoencoder
- Ziel: Generatives modell das "synthetische" daten generieren kann
- Problem 1: Das Problem, das im Zusammenhang mit Variational Autoencodern (VAEs) und dem wahren Posterior $p(ℎ∣x)p(h∣x)$ erwähnt wird, bezieht sich auf die Schwierigkeit, diese Wahrscheinlichkeitsverteilung direkt zu berechnen. In VAEs ist $p(h ∣ x)$ die bedingte Wahrscheinlichkeitsverteilung der latenten Variablen h gegeben die Beobachtung x. Diese Verteilung zu berechnen ist oft rechnerisch sehr aufwändig oder sogar undurchführbar, da sie eine Integration über alle möglichen Werte der latenten Variablen erfordert.
	- Lösung:
	- $L_d(w) = -E_{h \sim q(h|x)}[\log p(x|h)] + D_{KL}(q(h|x) || p(h))$
	- $L_d(w)$ ist der gesamte Verlust des VAE
	- $-E_{h \sim q(h|x)}[\log p(x|h)]$ repräsentiert den negativen Erwartungswert des Logarithmus der Wahrscheinlichkeit, dass der Decoder x aus h rekonstruiert, wobei h der Verteilung `q(h|x)` folgt.
	- $D_{KL}(q(h|x) || p(h))$ ist die Kullback-Leibler-Divergenz zwischen der Verteilung `q(h|x)` und der a priori Verteilung der latenten Variablen `p(h)`, die als Regularisierungsterm dient.
	- Der Rekonstruktionsloss "-E..." sorgt dafür dass der decoder gute ergebnisse liefert wenn vom encoder gesampled wird
	- Der Regularisierungsloss "Dkl..." sorgt dafür dass das encoder modell q(h|x) nah am prior p(h) ist.
- Wie sollten die modellverteilungen gewählt werden?
	- Gaussian für Prior: $p(h) = N(0|I)$ welcher die latenten variablen enkodiert (farbe,formen,attribute...)
	-  rest kommt
- Problem 2: Wie wird backpropagation für eine sampling node gemacht?
	- In einem VAE wird der latente Raumvektor ℎ durch das Ziehen einer Probe aus der Verteilung q(h∣x) generiert (zufälliger prozess). Diese Verteilung ist durch die Parameter (z.B. Mittelwert und Varianz) definiert, die vom Encoder berechnet werden.
	- Der stochastische Prozess des Probensamplings verhindert die direkte Rückverfolgung der Gradienten durch den Sampling-Knoten, was für die Anwendung von Backpropagation notwendig ist.
	- Ohne eine Möglichkeit, Gradienten durch diesen stochastischen Prozess zurückzuverfolgen, kann das Netzwerk nicht effektiv trainiert werden, da der Backpropagation-Algorithmus nicht angewendet werden kann.
	- Lösung Reparametrisierungstrick:
		- Der Reparametrisierungstrick löst dieses Problem, indem er das Sampling in einen differenzierbaren Prozess umwandelt.
		- Anstatt direkt aus q(h∣x) zu proben, wird ℎ reformuliert als h=μ+σ⊙ϵ, wobei μ und σ die vom Encoder gelernten Parameter sind und ϵ eine Probe aus einer Standardnormalverteilung ist.
		- Diese Umformulierung ermöglicht es, den Zufallsprozess des Probensamplings außerhalb des Netzwerks zu halten. μ und σ sind weiterhin Teil des Netzwerks und damit differenzierbar
		- Durch den Reparametrisierungstrick wird das Sampling zu einem Teil des Netzwerks, das vollständig differenzierbar ist. Dies erlaubt die Anwendung des Backpropagation-Algorithmus und somit ein effektives Training des Netzwerks
				-   q(h|x) = wahrscheinlichkeitsverteilung der latenten variablen (h) gegeben der eingangsdaten (x) -> Typischerweise parameter für normalverteilung wie mittelwert μ und die Standardabweichung σ.
				- latente variablen: In maschinellen Lernmodellen, insbesondere in VAEs, repräsentieren latente Variablen oft die verborgene Struktur der Eingabedaten. Diese Variablen sind Teil eines "latenten Raums", der eine kompakte und effiziente Repräsentation der Eingabedaten bietet. Der latente Raum ermöglicht es dem Modell, wichtige Merkmale der Daten zu lernen und zu abstrahieren.
### Generative Adversarial Networks (GANs)
- Generator: Fokussiert auf sampeln von neuen daten ohne explizit den encoder zu modellieren
- Discrimitator: versucht zwischen fake und real zu unterscheiden
## Sequence Modeling: Rekkurente Netze
##
# Exposé

## Thema
Ich schreibe über "Klassifizierung und Transfer zwischen Sprachniveaus im Deutschen mithilfe von LLMs".

## Vorlage

# 1. Einführung

**Ziel:** Einführung des Forschungsthemas und Erklärung dessen Bedeutung für die Informatik.

**Leitfragen:**
- Was ist das Forschungsthema?
- Warum ist es relevant für die Informatik?

# 2. Verwandte Arbeiten

**Ziel:** Überblick über bestehende Forschung im Bereich und Erklärung, wie die vorgeschlagene Forschung zum Gebiet beitragen wird.

**Tipps:**
- Zusammenfassung der wichtigsten Ergebnisse der verwandten Arbeiten
- Hervorhebung der Lücken oder Einschränkungen in der bestehenden Forschung, die die vorgeschlagene Forschung angehen wird

**Leitfragen:**
- Was ist die bestehende Forschung im Bereich?
- Wie lässt diese sich gliedern oder welche Unterscheidungen in Ansätzen gibt es?
- Was sind die wichtigsten Ergebnisse der verwandten Arbeiten?
- Welche Lücken oder Einschränkungen in der bestehenden Forschung wird die vorgeschlagene Forschung angehen?

# 3. Forschungsfrage

**Ziel:** Klar formulierte Forschungsfrage, die in der Arbeit beantwortet werden soll. Diese wird auf Dauer gemeinsam erarbeitet und nachgeschärft.

**Leitfragen:**
- Was ist die Forschungsfrage, die in der Arbeit beantwortet werden soll?

**Tipp:** Die Forschungsfrage sollte möglichst auf eine Frage präzise herunter gebrochen werden. Weitere Erläuterungen und Herleitungen sind in anderen Teilen zu finden.

# 4. Methodik

**Ziel:** Beschreibung der Forschungsmethodik, die verwendet wird, um die Forschungsfrage zu beantworten, und Erklärung ihrer Eignung für die Forschungsfrage.

**Tipps:**
- Überlegung zur Durchführbarkeit der Forschungsmethodik
- Kann diese innerhalb der vorhandenen Ressourcen und Zeitrahmen umgesetzt werden?
- Kurzer Überblick über die Datenkollektions- und Analysemethoden, die verwendet werden

**Leitfragen:**
- Was ist die Forschungsmethodik, die verwendet wird, um die Forschungsfrage zu beantworten?
- Warum ist diese Forschungsmethodik für die Forschungsfrage geeignet?
- Welche Datenkollektions- und Analysemethoden werden verwendet?

# 5. Erwartete Ergebnisse

**Ziel:** Kurzer Überblick über die erwarteten Ergebnisse und Einordnung.

**Leitfragen:**
- Was sind die erwarteten Ergebnisse der Forschung?
- Wie werden die Ergebnisse die Forschungsfrage beantworten?
- Sind diese Ergebnisse SMART (spezifisch, messbar, akzeptiert, realistisch und terminiert)?
  Wie können sie SMART gemacht werden bzw. die Forschungsfrage SMART beantwortet werden?

# 6. Zeitplan

**Ziel:** Übersicht über den Zeitplan für die Durchführung und Fertigstellung der Arbeit.

**Grundstruktur / Bereiche der Arbeit:**
- # Wochen Einarbeitung Literatur, bestehende Ansätze
- # Wochen Konzepterstellung
- # Wochen Implementierung
- Textgliederung
- Text schreiben
- 2 Wochen für Vorkorrektur durch den Betreuenden und Einarbeiten Korrekturen einplanen
- ~2 Wochen Puffer für zeitliche Verschiebungen

**Tipps:**
- Planung der Zeit für jeden Schritt der Forschung, einschließlich Datenkollektion, Analyse und Schreibprozess
- Beachtung von Fristen und Meilensteinen, wie z.B. Abgabetermine für die Arbeit

**Leitfragen:**
- Wie viel Zeit steht zur Verfügung, um die Forschung durchzuführen und die Arbeit abzuschließen?
- Welche Fristen und Meilensteine müssen beachtet werden?
- Wie wird die Zeit für jeden Schritt der Arbeit geplant?

# 7. Schlussfolgerung

**Ziel:** Zusammenfassung der wichtigsten Punkte des Exposés und Wiederholung der Bedeutung der Forschungsfrage und ihrer Relevanz für die Forschung

## Exposé Umsetzung

### 1. Einführung
In der Bachelor Arbeit wird die Klassifizierung und der Transfer zwischen Sprachniveaus im Deutschen mithilfe von LLMs untersucht. Dabei soll zum einen die Klassifizierung von Texten in verschiedene Sprachniveaus im europäischen Referenzrahmen für Sprachen (A1-C2) durchgeführt werden. Zum anderen soll der Transfer von Texten zwischen den Sprachniveaus untersucht werden.
dazu kann dem Modell ein Text in einem Sprachniveau und ein Ziel Sprachniveau gegeben werden. Das Modell soll dann den Text in das Ziel Sprachniveau übersetzen. 

Das Thema ist relevant für die Informatik, da sich LLMs perfekt für diesen Zweck eignen. Ursprünglich wurde die Transformer Architektur ja auch mit dem Ziel entwickelt, die Übersetzung zwischen Sprachen zu ermöglichen. Die Anwendung auf Sprachniveaus ist eine naheliegende Erweiterung.

### 2. Verwandte Arbeiten
Es gibt bereits einige Arbeiten, die sich mit der Klassifizierung von Texten in verschiedene Sprachniveaus beschäftigen. Diese haben jedoch einen anderen Ansatz gewählt. Sie verwenden eigens Trainierte Modelle (keine LLMs), die auf den Sprachniveaus trainiert wurden und als Klassifikator agieren. Hier besteht noch eine große Lücke, da noch nicht wirklich die Verwendung von LLMs für diesen Zweck untersucht wurde. Dies ist auch relevant, da das LLM im gleichen Schritt auch eine Übersetzung in ein anderes Sprachniveau durchführen kann. In diesem Bereich gibt es auch noch keine wirkliche Forschung.
Zu beachten bei bestehender Forschung ist, dass aktuell nur im englischen Bereich geforscht wurde. Im deutschen gibt es noch keine Forschung in diesem Bereich. Dies ist dementsprechend relevant, da die Leistung von LLMs wesentlich von der verwendeten Sprache und deren Anteil in den Trainingsdaten abhängt.
Kurze Experimente haben gezeigt, dass die aktuellen Modelle die Klassifizierung zwar einigermaßen gut hinkriegen, jedoch gibt es erhebliche Mängel bei dem Transfer zwischen den Sprachniveaus. Die Modelle verfallen in Englische Muster zurück und schaffen es nicht, die Sprachniveaus zu halten. Hier wäre ein gute Ansatzpunkt für die Forschung.

### 3. Forschungsfrage
> *Bis jetzt nur Ansatz/erste Idee, wird noch weiter besprochen!*

Wie können LLMs für die Klassifizierung und den Transfer zwischen Sprachniveaus im Deutschen eingesetzt werden?

### 4. Methodik
Die Forschungsmethodik wird sich auf die Verwendung von LLMs konzentrieren. Erst werde ich versuchen bestehende Ansätze zu untersuchen und zu gucken, wie weit ich diese für mein Problem adaptieren kann. Hier ist besonders die Übertragung von den englischen Ansätzen auf das Deutsche interessant.
Für die Forschungsmethodik habe ich zwei Wege, die ich evaluieren werde.
1. Die erste Möglichkeit ist, ein bestehendes LLM (Wahrscheinlich ein LLaMA Modell welches mit deutschen Daten gefinetuned wurde) zu verwenden und dieses mit prompting zur Problemlösung zu bewegen. Hier bietet es sich an, mit verschiedenen Formulierung, Beispielen und Parametern zu experimentieren. [Hier habe ich bereits gute Erfahrungen gemacht, was die Klassifizierung der Sprachniveaus angeht, jedoch noch nicht mit dem Transfer]
2. Die zweite Möglichkeit ist, ein bestehendes LLM mit entsprechenden Trainingsdaten zu finetunen. Hierbei werde ich verschiedene Ansätze ausprobieren, wie ich das Modell am besten dazu bringe, die Sprachniveaus zu erkennen und zu halten.

> Wichtig für diese beiden Ansätze ist es, die Modelle evaluieren zu können. Dafür werde ich wahrscheinlich einen Benchmark entwickeln bei welchem sichergestellt ist, dass die Testdaten noch nicht in den Trainingsdaten enthalten sind. Dieser ist dann hilfreich um die Modelle bzw verschiedenen Ansätze zu evaluieren.

Zudem muss ich bei beiden Ansätzen ein Basis LLM verwenden. Hier bietet es sich auch an, erst den Benchmark zu entwickeln und dann zu gucken, welches Modell sich am besten eignet.

Die Forschungsmethodik ist für die Forschungsfrage geeignet, da sie es ermöglicht, die Klassifizierung und den Transfer zwischen Sprachniveaus im Deutschen zu untersuchen. Die Verwendung von LLMs ist hierbei besonders geeignet, da diese Modelle für die Verarbeitung von natürlicher Sprache optimiert sind. Ursprünglich wurden Transformer Modelle ja auch für die Übersetzung zwischen Sprachen entwickelt. Eine Übersetzung zwischen Sprachniveaus ist hier dann nahe liegend.

### 5. Erwartete Ergebnisse
Ich erwarte, dass mit Prompting auf jeden Fall eine Klassifizierung der Sprachniveaus möglich ist. Dies hatte bereits bei ersten Versuchen schon zu Erfolg geführt. Vielleicht ist es auch möglich, mit Prompting den Transfer zu ermöglichen. Hier bin ich jedoch noch skeptisch, da die Modelle dazu neigen, in Englische Muster zurückzufallen und die Sprachniveaus nicht halten. Um dies zu vermeiden, ist es wahrscheinlich notwendig, das Modell zu finetunen. Hierbei erwarte ich, dass das Modell die Sprachniveaus besser halten kann. Dies sollte mit genügend (und qualitativen) Trainingsdaten auch erfolgreich sein.

Wenn dies gelingt, würde es die Forschungsfrage beantworten und die Anwendung von LLMs auf Sprachniveaus im Deutschen ermöglichen.

**spezifisch**: Die Forschungsfrage ist spezifisch formuliert und bezieht sich auf die Klassifizierung und den Transfer zwischen Sprachniveaus im Deutschen mithilfe von LLMs.

**messbar**: Mit einem Benchmark kann die Leistung der Modelle objektiv gemessen und vergleichen werden. So kann eine qualitative Verbesserung im Vergleich zu bestehenden Ansätzen bzw den ursprünglichen Modellen gemessen werden.

**akzeptiert**: Die Forschungsfrage ist relevant für die Informatik und baut auf bestehender Forschung auf. Zudem gibt es an der Universität potentielle Anwendungsbereiche.

**realistisch**: Ich gehe davon aus, dass die Modelle die Sprachniveaus erkennen können. Der Transfer ist auch realistisch, jedoch wird es wahrscheinlich notwendig sein, das Modell zu finetunen. Dies ist jedoch auch realistisch, da es bereits viele Ergebnisse gibt, die zeigen, dass das Finetuning von LLMs erfolgreich genutzt werden kann um sie auf spezifische Probleme anzupassen.

**terminiert**: ??

### 6. Zeitplan
- 2 Wochen Einarbeitung in Literatur und bestehende Ansätze
- 2 Wochen Konzepterstellung
???

### 7. Schlussfolgerung
In der Bachelor Arbeit wird die Klassifizierung und der Transfer zwischen Sprachniveaus im Deutschen mithilfe von LLMs untersucht. Dabei soll zum einen die Klassifizierung von Texten in verschiedene Sprachniveaus im europäischen Referenzrahmen für Sprachen (A1-C2) durchgeführt werden. Zum anderen soll der Transfer von Texten zwischen den Sprachniveaus untersucht werden. Dafür werden verschiedene Ansätze evaluiert und miteinander verglichen. Die Forschungsmethodik wird sich auf die Verwendung von LLMs konzentrieren. Es werden zwei Ansätze evaluiert: Die Verwendung von Prompting und das Finetuning von LLMs.


# Verbesserte Version
### 1. Einführung
In der Bachelorarbeit wird die Klassifizierung und der Transfer zwischen verschiedenen Sprachniveaus im Deutschen unter Verwendung von Large Language Models (LLMs) untersucht. Dabei wird einerseits die Klassifizierung von Texten nach den Niveaustufen des Gemeinsamen Europäischen Referenzrahmens für Sprachen (A1-C2) durchgeführt. Andererseits wird der Transfer von Texten zwischen diesen Sprachniveaus analysiert. Dem Modell wird dazu ein Text auf einem bestimmten Sprachniveau und ein Ziel-Sprachniveau vorgegeben, woraufhin es den Text entsprechend transformieren soll.

Die Relevanz des Themas für die Informatik ergibt sich aus der Eignung von LLMs für diese Art der Textverarbeitung. Die Transformer-Architektur, die bei LLMs zum Einsatz kommt, wurde ursprünglich entwickelt, um Übersetzungen zwischen verschiedenen Sprachen zu erleichtern. Die Anwendung dieser Technologie auf unterschiedliche Sprachniveaus stellt eine intuitive Erweiterung dar.

### 2. Verwandte Arbeiten
Es existieren bereits Forschungsarbeiten, die sich mit der Klassifizierung von Texten in verschiedene Sprachniveaus beschäftigen. Diese Arbeiten verwenden jedoch speziell trainierte Modelle (keine LLMs) und agieren primär als Klassifikatoren. Die Erforschung der Anwendung von LLMs für diese Zwecke ist noch ein relativ unerschlossenes Feld. Hinzu kommt, dass sich die vorhandene Forschung überwiegend auf englische Texte konzentriert und kaum Erkenntnisse für den deutschen Sprachraum vorliegen. Dies ist besonders relevant, da die Leistungsfähigkeit von LLMs stark von der Sprache und dem Umfang der in den Trainingsdaten vertretenen Sprache abhängt. Erste Experimente zeigen, dass aktuelle Modelle die Klassifizierung zwar grundsätzlich bewältigen, aber erhebliche Mängel beim Niveau-Transfer aufweisen, da sie zu englischen Mustern tendieren.

### 3. Forschungsfrage
> Wie können LLMs effektiv für die Klassifizierung und den Transfer zwischen Sprachniveaus im Deutschen genutzt werden?

### 4. Methodik
Die Methodik der Forschung konzentriert sich auf den Einsatz von LLMs. Zunächst wird untersucht, inwieweit bestehende Ansätze auf das vorliegende Problem übertragen werden können, insbesondere die Übertragung von Techniken aus dem Englischen ins Deutsche. Es werden zwei Hauptansätze verfolgt:
1. Die Verwendung eines bereits existierenden LLMs (möglicherweise ein auf Deutsch angepasstes LLaMA-Modell), das durch gezieltes Prompting für das spezifische Problem eingesetzt wird. Dabei wird mit verschiedenen Formulierungen, Beispielen und Parametern experimentiert.
2. Das Finetuning eines LLMs mit entsprechenden Trainingsdaten, um das Modell besser auf die Erkennung und Beibehaltung der Sprachniveaus auszurichten.

Zur Evaluation der Modelle ist die Entwicklung eines Benchmarks geplant, der sicherstellt, dass die Testdaten nicht bereits in den Trainingsdaten enthalten waren. Dies ist entscheidend, um die Effektivität der verschiedenen Ansätze zu messen.

### 5. Erwartete Ergebnisse
Es wird erwartet, dass es möglich ist, die Sprachniveaus mittels Prompting zuverlässig zu klassifizieren, wie bereits erste Versuche gezeigt haben. Ob auch der Transfer zwischen den Niveaus durch Prompting realisiert werden kann, bleibt abzuwarten, da die Modelle dazu tendieren, in englische Sprachmuster zurückzufallen. Ein Finetuning des Modells könnte notwendig sein, um die Niveautreue zu verbessern. Hierbei wird erwartet, dass das Modell, unterstützt durch ausreichende und qualitativ hochwertige Trainingsdaten, die Sprachniveaus besser halten kann.

### 6. Zeitplan
- Zwei Wochen zur Einarbeitung in die relevante Literatur und bestehende Ansätze.
- Zwei Wochen zur Konzepterstellung und Vorbereitung.
???

### 7. Schlussfolgerung
Die Bachelorarbeit befasst sich mit der Klassifizierung und dem Transfer von Texten zwischen verschiedenen Sprachniveaus im Deutschen unter Einsatz von LLMs. Unterschiedliche Ansätze, insbesondere das Prompting und das Finetuning von LLMs, werden evaluiert und hinsichtlich ihrer Eignung für die gestellten Aufgaben verglichen. Die methodische Herangehensweise zielt darauf ab, die Potenziale von LLMs in diesem spezifischen Anwendungsbereich zu demonstrieren und weiterzuentwickeln.

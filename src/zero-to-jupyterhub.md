# Zero to JupyterHub

Zero to JupyterHub beschreibt den Betrieb von JupyterHub in einem Kubernetes-Cluster.

**Mit der Vorgabe, Programme ohne Container direkt auf Ubuntu zu installieren, ist dieser Weg nicht vereinbar.** Der [offizielle Aufbau](https://z2jh.jupyter.org/en/stable/) verwendet Kubernetes, Helm und Container-Images. Eine Installation ohne Docker-Kommando bedeutet hier nicht, dass keine Container verwendet werden.

Die JupyterHub-Komponenten sind freie Software; Cluster, Speicher, Netzwerk und Administration verursachen dennoch Kosten. Die jeweiligen [Projektlizenzen](https://github.com/jupyterhub/zero-to-jupyterhub-k8s) und die Lizenzen verwendeter Images sind getrennt zu beachten.

## Vorgehen auf diesem Ubuntu-Rechner

1. Entscheide, ob die containerfreie Vorgabe weiter gilt. Unter dieser Vorgabe gibt es für Zero to JupyterHub keinen passenden lokalen Installationsbefehl.

2. Verwende für einen einzelnen dedizierten Server stattdessen das Kapitel [The Littlest JupyterHub](tljh.md). Dieser Aufbau kommt ohne Kubernetes aus.

3. Ziehe bei ausdrücklich gewünschtem Kubernetes-Betrieb die offizielle Anleitung heran. Dafür sind vorab Clusterzugang, Speicherkonzept, Domain, TLS, Anmeldung und Ressourcenplanung festzulegen; allein die Installation von Helm erzeugt noch keinen JupyterHub.

## Prüfen

1. Prüfe die gewählte Architektur: Ein Helm-Release mit Hub- und Notebook-Pods ist ein Containerbetrieb und erfüllt die lokale Vorgabe nicht.

2. Prüfe bei der TLJH-Alternative die Anmeldung und Notebook-Ausführung anhand des dortigen Kapitels.

## Entfernen

1. Für dieses Kapitel ist keine Deinstallation erforderlich, da es keine Installation veranlasst.

2. Falls bereits ein unabhängig eingerichteter Cluster besteht, sichere dessen Benutzerdaten vor jedem Rückbau. Ein Helm-Uninstall allein entfernt nicht verlässlich alle Volumes, Datenträger oder kostenpflichtigen Cloud-Ressourcen; der Rückbau muss zum konkreten Cluster passen.

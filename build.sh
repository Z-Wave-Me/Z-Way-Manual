#!/bin/bash

if [ "$1" == "clean" ]; then
	find -name *.aux -exec rm {} \;
fi

# PDF version
pdflatex ZWayManual.tex

# Prepare HTML version

rm -R ZWayManual

latex2html -split +1 -no_auto_link -long_titles 20 -use_pdftex -html_version 5.0,math,unicode -no_navigation -no_footnode -info "" ZWayManual.tex

cd ZWayManual

# extract TOC
echo '<div id="TOC">' > TOC.html
awk '/^<!--End of Table of Child-Links-->$/ { tocStart = 0 } { if (tocStart) { print } } /^<!--Table of Child-Links-->$/ { tocStart = 1 }' ZWayManual.html >> TOC.html
echo '</div>' >> TOC.html
# delete TOC
awk -i inplace '/^<!--Table of Child-Links-->$/ { tocStart = 1 } !/^<BR><HR>$/ { if (!tocStart) { print } } /^<!--End of Table of Child-Links-->$/ { tocStart = 0 }' ZWayManual.html
# add CSS styles and alter existing
sed -i 's/^\.CENTER  { text-align:center; }$/.CENTER  { }/' ZWayManual.css
sed -i 's/^\.CENTER > \* { margin:auto; }$/.CENTER > * { }/' ZWayManual.css
cat ../html/ZWayManualAddOn.css >> ZWayManual.css
# copy JS for TOC
cp ../html/ZWayManualAddOn.js ZWayManual.js

for f in `ls -1 *.html`; do
	# change meta keywords
	sed -i 's/<META NAME="keywords" CONTENT="ZWayManual">/<META NAME="keywords" CONTENT="Z-Way Manual">/' $f
	# change title
	sed -i 's/<TITLE>/<TITLE>Z-Way Manual — /' $f
	# delete subsection TOC
	awk -i inplace '/^<!--Table of Child-Links-->$/ { tocStart = 1 } !/^<HR>$/ { if (tocStart == 2) { tocStart = 0 } } { if (!tocStart) { print } } /^<!--End of Table of Child-Links-->$/ { tocStart = 2 }' $f
	# add TOC in new format
	sed -i '/<BODY >/ r TOC.html' $f
	# install JS for TOC
	sed -i 's|</HEAD>|<script src="ZWayManual.js" defer></script>\n</HEAD>|' $f
done

ln -s ZWayManual.html index.html

rm TOC.html

cd ..

rm -f TOC.html ZWayManual.css

# Copy to the server

scp ZWayManual.pdf ZWayManual/* zwm1.z-wave.me:/var/www/z-wave.me/manual/z-way/

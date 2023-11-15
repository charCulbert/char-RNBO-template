async function setup() {
    const patchExportURL = "patch.export.json"; // path to the patch export json from RNBO
    const WAContext = window.AudioContext || window.webkitAudioContext; // audio context or webkit audio context for different age browsers
    const context = new WAContext(); // creating the new audio context

    const outputNode = context.createGain(); // creating a gain node
    outputNode.gain.value = 0.3;
    outputNode.connect(context.destination); // connecting the gain node to the output of the audio context
    attachGainSlider(outputNode, context);

    try {
        //grab the JSON file and access it as json
        const response = await fetch(patchExportURL);
        const patcher = await response.json();

        //create the RNBO device within the audio context
        const device = await RNBO.createDevice({ context, patcher });
        //connect the RNBO device to the gain node which connects to output
        device.node.connect(outputNode);

        // attach the freq slider to the RNBO device
        attachFreqSlider(device);

        //resume Audio Context on a click on the body
        document.body.onclick = () => context.resume();

    } catch (err) {
        console.error("Error setting up RNBO device:", err);
    }
}

function attachFreqSlider(device) {
    let freqSlider = document.getElementById("freqSlider");

    // Check if the 'freq' parameter exists
    const param = device.parametersById.get("freq");

    // attaching to the RNBO param
    freqSlider.addEventListener("input", () => {
        let value = Number.parseFloat(freqSlider.value);
        param.value = value; // Set the RNBO parameter value
    });

}

function attachGainSlider(outputNode, context) {
    let gainSlider = document.getElementById('gainSlider');

    gainSlider.addEventListener('input', () => {
        let value = parseFloat(gainSlider.value);
        outputNode.gain.linearRampToValueAtTime(value, context.currentTime + 0.01); // Smooth transition
    });

    gainSlider.value = outputNode.gain.value;
}



// run the setup 
setup();


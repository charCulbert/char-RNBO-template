async function setup() {
    const patchExportURL = "patch.export.json";
    const WAContext = window.AudioContext || window.webkitAudioContext;
    const context = new WAContext();

    const outputNode = context.createGain();
    outputNode.connect(context.destination);

    try {
        const response = await fetch(patchExportURL);
        const patcher = await response.json();

        const device = await RNBO.createDevice({ context, patcher });
        device.node.connect(outputNode);

            // (Optional) Automatically create sliders for the device parameters
    makeSliders(device);

    // (Optional) Create a form to send messages to RNBO inputs
    // makeInportForm(device);

    // (Optional) Attach listeners to outports so you can log messages from the RNBO patcher
    // attachOutports(device);

        document.body.onclick = () => context.resume();

    } catch (err) {
        console.error("Error setting up RNBO device:", err);
    }
}

function makeSliders(device) {
    let freqSlider = document.getElementById("freqSlider");
    let isDraggingSlider = false;

    // Check if the 'freq' parameter exists
    const param = device.parametersById.get("freq");
    if (!param) {
        console.error("'freq' parameter not found in RNBO device");
        return; // Exit the function if the parameter doesn't exist
    }


    freqSlider.addEventListener("input", () => {
        let value = Number.parseFloat(freqSlider.value);
        param.value = value; // Set the RNBO parameter value
    });

    // Update slider value on pointer events
    freqSlider.addEventListener("pointerdown", () => {
        isDraggingSlider = true;
    });

    freqSlider.addEventListener("pointerup", () => {
        isDraggingSlider = false;
        freqSlider.value = param.value;
    });

    // Optional: Listen to parameter changes from the device to update the slider
    device.parameterChangeEvent.subscribe(updatedParam => {
        if (!isDraggingSlider && updatedParam.id === param.id) {
            freqSlider.value = updatedParam.value;
        }
    });
}

setup();


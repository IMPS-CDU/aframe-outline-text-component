## aframe-outline-text-component
Outlined text to improve visibility against varied backgrounds. Based heavily on [three.js WebGL geometry text shapes](https://threejs.org/examples/?q=text#webgl_geometry_text_shapes).


## Properties

| Property      | Description                                                                                                                                           | Default Value                     |
|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------|
| align         | Multi-line text alignment (left, center, right).                                                                                                      | left                              |
| color         | Text color.                                                                                                                                           | white                             |
| font          | Font to render text, either the name of one of [threeJS stock fonts](https://github.com/mrdoob/three.js/tree/dev/examples/fonts) or a URL to a font file                                          | helvetiker_regular |
| opacity       | Opacity, on a scale from 0 to 1, where 0 means fully transparent and 1 means fully opaque.                                                            | 1.0                               |
| side          | Side to render. (front, back, double)                                                                                                                 | front                             |
| **value**     | The actual content of the text. Line breaks and tabs are supported with `\n` and `\t`.                                                                | ''                                |


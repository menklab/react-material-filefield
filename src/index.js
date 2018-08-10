import React from 'react';
import Dropzone from 'react-dropzone';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import IconButton from '@material-ui/core/IconButton';
import RemoveIcon from '@material-ui/icons/Remove';
import AddIcon from '@material-ui/icons/Add';
import BlockIcon from '@material-ui/icons/Block';
import { withStyles } from '@material-ui/core/styles';
import Image from 'material-ui-image'
import ButtonBase from '@material-ui/core/ButtonBase';
import PropTypes from 'prop-types';

const styles = theme => ({
    gridListContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        textAlign: 'left',
        marginTop: theme.spacing.unit * 2,
    },
    gridListTileInnerDiv: {
        width: '100%',
        height: 'auto',
    },
    fileCaption: {
        textAlign: 'center',        
    },
    buttonBase: {
        width: '100%',
        height: '100%',
    },
    dropzone: {
        width: '100%',
        height: '100%',
        border: '2px dashed rgba(0, 0, 0, 0.42)',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        paddingTop: 'calc(100%)',
        position: 'relative',
    },
    dropzoneAccept: {
        border: '2px #0F0 solid',
    },
    dropzoneReject: {
        border: '2px #F00 solid',
    },
    dropzoneDisabled: {
        border: 'none',
        backgroundColor: '#CCC',
    },
    addIconContainer: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeIcon: {
        color: '#FFF',
    },
});

const imageContainerStyles = {
    width: '100%',
    height: '100%',
    border: '1px solid rgba(0,0,0,0.42)',
    background: 'rgba(0,0,0,0)',
    boxSizing: 'border-box',
};

const imageStyles = {
    objectFit: 'contain',
    objectPosition: '50% 50%',
};
 
class FileField extends React.Component {
    onAdd = (newFiles) => {
        let { multiple, maxNumFiles } = this.props;
        let files = this.props.files || [];
        // Find the most number of images we can have.
        if (multiple === false) maxNumFiles = 1;
        let numOpenTiles = Math.max(maxNumFiles - files.length, 0);
        let numToAccept = Math.min(numOpenTiles, newFiles.length);
        // Create an array of new items to add.
        let acceptedNewFiles = [];
        for (let i = 0; i < numToAccept; i++) {            
            // Accept file.
            let file = newFiles[i];
            acceptedNewFiles.push(file);
        }
        this.onAddFiles(acceptedNewFiles);
    };

    onAddFiles = (files) => {
        for (let i = 0; i < files.length; i++) {
            let currentFile = files[i];
            let reader  = new FileReader();
            reader.onload = (function (file, context) {
                return function(e) {
                    let fileReaderDataURL = e.target.result;

                    // Validate file size.
                    let { maxFileSize, onAddFile, onAddError } = context.props;
                    if (maxFileSize < file.size) {
                        window.URL.revokeObjectURL(fileReaderDataURL);
                        onAddError("file exceeds max size");
                        return;
                    }
                    
                    // Try to load an validate any image.
                    let image = document.createElement("img");
                    image.onload = (function(file, dataURL, ctx) {
                        return function(e) {
                            // Validate the image resolution.
                            let width = e.target.width;
                            let height = e.target.height;
                            let { minImageWidth, minImageHeight, onAddFile, onAddError } = ctx.props;
                            if (minImageWidth > width || minImageHeight > height) {
                                window.URL.revokeObjectURL(dataURL);
                                onAddError("image resolution too low");
                                return;
                            }
                            // Save the preview of the image and trigger the callback.
                            file.preview = dataURL;
                            onAddFile(file);
                        }
                    })(file, fileReaderDataURL, context);

                    // If the image didn't load, the file is not an image.
                    image.onerror = function() {
                        onAddFile(file);
                    }

                    // Attempt the image load.
                    image.src = fileReaderDataURL;
                }
            })(currentFile, this);
            reader.readAsDataURL(currentFile);
        }
    }

    onRemove = (index) => {
        let {files, onRemoveFile} = this.props;
        let file = files[index];
        if (file.preview) window.URL.revokeObjectURL(file.preview);
        onRemoveFile(index);
    }
 
    render() {
        let { 
            classes,
            gridListContainerStyle,
            title,
            cols,
            accept,
            multiple,
            disabled,
            minImageWidth,
            minImageHeight,
            maxFileSize,
            files,
            onAddFile,
            onAddError,
            onRemoveFile,
            maxNumFiles,
            ...props
        } = this.props;

        return (
            <FormControl margin="normal" disabled={disabled} {...props}>
                <Typography variant="caption" align="left">{title}</Typography>
                <div className={classes.gridListContainer} style={gridListContainerStyle}>
                    <GridList cols={cols} cellHeight={'auto'}>
                        {/* File tiles. */}
                        {files.map((file, index) => (
                            <GridListTile key={index}>
                                <div className={classes.gridListTileInnerDiv}>
                                    <Image src={file.preview ? file.preview : ""} alt={file.name} style={imageContainerStyles} imageStyle={imageStyles}/>
                                    <GridListTileBar
                                        titlePosition="top"
                                        actionPosition="left"
                                        actionIcon={
                                            <IconButton onClick={() => this.onRemove(index)}>
                                                <RemoveIcon className={classes.removeIcon}/>
                                            </IconButton>
                                        }
                                    />
                                </div>
                                <Typography className={classes.fileCaption} variant="caption">{file.name}</Typography>
                            </GridListTile>
                        ))}
                        {/* Add tile */}
                        {   (multiple === true || files.length < 1) && 
                            (files.length < maxNumFiles) &&
                        (
                            <GridListTile>
                                <div className={classes.gridListTileInnerDiv}>
                                    <ButtonBase className={classes.buttonBase} disableRipple={disabled}>   
                                        <Dropzone
                                            disablePreview={true}
                                            className={classes.dropzone}
                                            acceptClassName={classes.dropzoneAccept}
                                            rejectClassName={classes.dropzoneReject}
                                            disabledClassName={classes.dropzoneDisabled}
                                            disabled={disabled}
                                            accept={accept}
                                            multiple={multiple}
                                            onDrop={this.onAdd.bind(this)}
                                        >
                                            <div className={classes.addIconContainer}>
                                                { disabled ? <BlockIcon /> : <AddIcon /> }
                                            </div>
                                        </Dropzone>
                                    </ButtonBase>
                                </div>
                            </GridListTile>
                        )}
                    </GridList>
                </div>
            </FormControl>
        );
    }
}

FileField.propTypes = {
    classes: PropTypes.object,
    gridListContainerStyle: PropTypes.object,
    title: PropTypes.string,
    cols: PropTypes.number,
    accept: PropTypes.string,
    multiple: PropTypes.bool,
    disabled: PropTypes.bool,
    minImageWidth: PropTypes.number,
    minImageHeight: PropTypes.number,
    maxFileSize: PropTypes.number,
    files: PropTypes.array.isRequired,
    onAddFile: PropTypes.func.isRequired,
    onAddError: PropTypes.func.isRequired,
    onRemoveFile: PropTypes.func.isRequired,
    maxNumFiles: PropTypes.number,
};

FileField.defaultProps = {
    title: '',
    cols: 1,
    accept: '*',
    multiple: true,
    disabled: false,
    minImageWidth: 0,
    minImageHeight: 0,
    maxFileSize: Number.MAX_SAFE_INTEGER,
    files: [],
    maxNumFiles: Number.MAX_SAFE_INTEGER,
};

export default withStyles(styles)(FileField);
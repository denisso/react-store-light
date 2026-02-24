/**
 * Prevent infinite loop when 
 */
export const UPDATE_FROM_PARENT_STORE = Symbol();

/**
 * Prvent infinite loop when executed set funtion 
 * set function runs update children and parent nodes 
 * but update paren node runs update childrens
 * for avoid inifinite loop set flag DO_NOT_UPDATE_TREE 
 * when  runs updtaes children and parent nodes
 */
export const DO_NOT_UPDATE_TREE = Symbol();

/**
 * 
 */
export const UPDATE_PARENT_ONLY_STORE = Symbol();

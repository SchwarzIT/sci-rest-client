<?xml version="1.0" encoding="ISO-8859-1"?><!--comment -->
<!--comment -->
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
	<xsl:output method="xml" version="1.0" indent="yes"
		omit-xml-declaration="no" />
	<xsl:template match="*[local-name()='GetOffboardUserRecordWithExportIdResult']">
		<!-- TODO: Auto-generated template -->
		<xsl:value-of select="." disable-output-escaping="yes"></xsl:value-of>
	</xsl:template>
</xsl:stylesheet>
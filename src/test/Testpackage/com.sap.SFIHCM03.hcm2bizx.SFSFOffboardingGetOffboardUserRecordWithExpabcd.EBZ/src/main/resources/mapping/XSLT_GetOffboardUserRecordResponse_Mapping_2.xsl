<?xml version="1.0" encoding="ISO-8859-1"?><!--comment -->
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"
	xmlns:ns0="http://sap.com/xi/SFIHCM03">

	<xsl:template match="GetOffboardUserRecordResult">
		<!-- TODO: Auto-generated template -->
		<xsl:element name="ns0:getNewHireRecordResponse"
			namespace="http://sap.com/xi/SFIHCM03">
			<xsl:apply-templates />
		</xsl:element>
	</xsl:template>

	<xsl:template match="*[local-name()='item']">
		<xsl:element name="Data">
			<xsl:apply-templates select="*[local-name()='key']" />
			<xsl:apply-templates select="*[local-name()='value']" />
		</xsl:element>
	</xsl:template>

	<xsl:template match="*[local-name()='key']">
		<xsl:element name="Field_Id">
			<xsl:value-of select="." />
		</xsl:element>
	</xsl:template>
	<xsl:template match="*[local-name()='value']">
		<xsl:element name="Field_Content">
			<xsl:value-of select="." />
		</xsl:element>
	</xsl:template>

	<xsl:template match="Errors">
		<xsl:copy-of select="." />
		<!-- node() -->
	</xsl:template>

	<xsl:template match="OffBoardUserRecord">
		<xsl:if
			test="not(self::node()[text()='00000000-0000-0000-0000-000000000000'])">
			<xsl:apply-templates />
		</xsl:if>		
	</xsl:template>

</xsl:stylesheet>